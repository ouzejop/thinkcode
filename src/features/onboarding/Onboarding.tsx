import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi } from '../../api/client';
import type { CourseInfo, PlacementQuestion } from '../../api/types';
import { sfx } from '../../lib/sfx';
import type { SpriteName } from '../../sprites/matrices';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProfileStore } from '../../stores/profileStore';
import { useSettingsStore, type RetroLevel } from '../../stores/settingsStore';
import {
  Avatar,
  Button,
  ChoiceCard,
  IconExplain,
  IconExample,
  IconHint,
  IconReveal,
  IconThink,
  PixelSprite,
  Stepper,
} from '../../ui';

const AVATARS: { name: SpriteName; label: string }[] = [
  { name: 'avatar-hero', label: 'Hero' },
  { name: 'avatar-wizard', label: 'Wizard' },
  { name: 'avatar-robot', label: 'Robot' },
  { name: 'avatar-cat', label: 'Cat' },
  { name: 'avatar-ghost', label: 'Ghost' },
  { name: 'avatar-knight', label: 'Knight' },
];

const LADDER_DEMO_RUNGS: { rung: number; name: string; sprite: SpriteName; badge: string; desc: string }[] = [
  {
    rung: 1,
    name: 'Think',
    sprite: 'climber',
    badge: '90 XP',
    desc: 'An interactive guiding question. Socrates asks you to analyze the behavior.',
  },
  {
    rung: 2,
    name: 'Hint',
    sprite: 'bulb',
    badge: '75 XP',
    desc: 'A conceptual nudge pointing in the right direction without line numbers or spoilers.',
  },
  {
    rung: 3,
    name: 'Explain',
    sprite: 'book',
    badge: '55 XP',
    desc: 'Detailed explanation of the programming pattern and syntax.',
  },
  {
    rung: 4,
    name: 'Example',
    sprite: 'puzzle',
    badge: '40 XP',
    desc: 'A similar solved problem with working code illustrating the concept.',
  },
  {
    rung: 5,
    name: 'Reveal',
    sprite: 'chest',
    badge: '15 XP',
    desc: 'The full solution code. Requires confirmation and triggers a mandatory rematch.',
  },
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const store = useOnboardingStore();
  const profile = useProfileStore();
  const settings = useSettingsStore();

  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [placementQuestions, setPlacementQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLadderDemoRung, setSelectedLadderDemoRung] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load catalog and placement questions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = await getApi();
        const [cat, pQuestions] = await Promise.all([
          api.getCatalog(),
          api.getPlacement(),
        ]);
        if (mounted) {
          setCourses(cat);
          setPlacementQuestions(pQuestions);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage('Unable to load catalog. Please retry.');
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const stepLabels = ['Identity', 'Track', 'Experience', 'Coach & Style', 'Launch'];

  // Step 1 validation: 3 letters initials
  const isStep1Valid = store.initials.trim().length === 3;
  // Step 2 validation: must pick an available course
  const isStep2Valid = store.courseId !== null;
  // Step 3 validation: must pick level
  const isStep3Valid = store.selfLevel !== null;

  const handleNext = () => {
    sfx.play('step');
    if (store.step < 5) {
      store.nextStep();
    }
  };

  const handleBack = () => {
    sfx.play('click');
    if (store.step > 1) {
      store.prevStep();
    }
  };

  const handleFinish = () => {
    sfx.play('clear');
    // Save to settings
    settings.setRetroLevel(store.retroLevel);
    settings.setSound(store.sound);

    // Save to profile
    profile.createProfile({
      initials: store.initials,
      avatar: store.avatar,
      courseId: store.courseId || 'javascript',
      selfLevel: store.selfLevel || 'newcomer',
      coachLang: store.coachLang,
      showOnLeaderboard: store.showOnLeaderboard,
    });

    // Propose on a single page: Login / Sign up OR Continue as Guest
    navigate('/auth/choice');
  };

  const handleRunPlacementCheck = async () => {
    try {
      const api = await getApi();
      const suggested = await api.calculatePlacement(store.placementAnswers);
      store.setSuggestedLevel(suggested);
    } catch {
      store.setSuggestedLevel('basics');
    }
  };

  return (
    <main className="zone-arcade min-h-screen py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl rounded-[var(--radius)] border-2 border-line bg-surface p-6 sm:p-8 shadow-[var(--shadow-hard)]">
        {/* Stepper Progress */}
        <Stepper
          currentStep={store.step}
          totalSteps={5}
          labels={stepLabels}
          className="mb-6"
        />

        {/* STEP 1: WHO ARE YOU */}
        {store.step === 1 && (
          <section aria-labelledby="step1-title" className="grid gap-6">
            <div>
              <h2 id="step1-title" className="text-xl font-bold text-ink">
                Who are you?
              </h2>
              <p className="text-sm text-soft">
                Choose 3 initials and select your retro arcade avatar.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 items-center">
              {/* Initials & Avatars */}
              <div className="grid gap-4">
                <div>
                  <label htmlFor="initials-input" className="t-label block mb-1">
                    Your Initials (3 letters)
                  </label>
                  <input
                    id="initials-input"
                    type="text"
                    maxLength={3}
                    value={store.initials}
                    onChange={(e) => store.setInitials(e.target.value)}
                    placeholder="ADA"
                    className="w-full rounded-[var(--radius)] border border-control bg-surface p-3 font-mono text-xl font-bold uppercase tracking-widest text-ink focus-visible:outline-primary"
                  />
                  {!isStep1Valid && (
                    <p className="text-xs text-fail mt-1 font-medium">
                      Please enter exactly 3 letters (A-Z).
                    </p>
                  )}
                </div>

                <div>
                  <span className="t-label block mb-2">Choose Avatar</span>
                  <div className="grid grid-cols-3 gap-2">
                    {AVATARS.map((av) => {
                      const isSelected = store.avatar === av.name;
                      return (
                        <button
                          key={av.name}
                          type="button"
                          aria-label={`Select ${av.label}`}
                          aria-pressed={isSelected}
                          onClick={() => {
                            sfx.play('click');
                            store.setAvatar(av.name);
                          }}
                          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-[var(--radius)] border transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-soft bg-surface hover:bg-sunken'
                          }`}
                        >
                          <Avatar seed={av.name} size={36} />
                          <span className="text-[11px] font-bold text-ink">{av.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Player Card Preview */}
              <div className="rounded-[var(--radius)] border-2 border-line bg-surface-sunken p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="t-label mb-2">Live Player Card</span>
                <div className="h-20 w-20 rounded-full border-2 border-line bg-surface flex items-center justify-center shadow-inner mb-3 overflow-hidden">
                  <Avatar seed={store.avatar} size={54} />
                </div>
                <div className="t-logo text-2xl text-primary font-bold">
                  {store.initials || '???'}
                </div>
                <div className="text-xs text-soft font-mono mt-1">
                  NEW RECRUIT · LEVEL 1
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STEP 2: CHOOSE YOUR TRACK */}
        {store.step === 2 && (
          <section aria-labelledby="step2-title" className="grid gap-6">
            <div>
              <h2 id="step2-title" className="text-xl font-bold text-ink">
                Choose your track
              </h2>
              <p className="text-sm text-soft">
                Select the programming language you want to learn with Socrates.
              </p>
            </div>

            {loading ? (
              <p className="text-soft">Loading catalog…</p>
            ) : errorMessage ? (
              <div className="p-4 bg-sunken border border-fail rounded text-fail">
                {errorMessage}
              </div>
            ) : (
              <div className="grid gap-4">
                {courses.map((course) => {
                  const isSelected = store.courseId === course.id;
                  const isAvailable = course.available;
                  return (
                    <ChoiceCard
                      key={course.id}
                      title={course.title}
                      subtitle={course.tagline}
                      badge={`${course.exerciseCount} cartridges`}
                      icon={
                        <PixelSprite
                          name={course.language === 'javascript' ? 'logo-js' : 'logo-py'}
                          size={32}
                        />
                      }
                      selected={isSelected}
                      disabled={!isAvailable}
                      disabledReason={!isAvailable ? 'Coming soon in next season!' : undefined}
                      onClick={() => {
                        if (isAvailable) {
                          sfx.play('click');
                          store.setCourseId(course.id);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* STEP 3: YOUR LEVEL */}
        {store.step === 3 && (
          <section aria-labelledby="step3-title" className="grid gap-6">
            <div>
              <h2 id="step3-title" className="text-xl font-bold text-ink">
                What is your experience level?
              </h2>
              <p className="text-sm text-soft">
                This helps customize coach explanations to your background.
              </p>
            </div>

            <div className="grid gap-3">
              <ChoiceCard
                title="Newcomer"
                subtitle="I'm just starting out or have never coded before."
                selected={store.selfLevel === 'newcomer'}
                onClick={() => {
                  sfx.play('click');
                  store.setSelfLevel('newcomer');
                }}
              />
              <ChoiceCard
                title="Basics"
                subtitle="I know variables, conditions, and basic loops."
                selected={store.selfLevel === 'basics'}
                onClick={() => {
                  sfx.play('click');
                  store.setSelfLevel('basics');
                }}
              />
              <ChoiceCard
                title="Confident"
                subtitle="I can write small programs on my own and want to build autonomy."
                selected={store.selfLevel === 'confident'}
                onClick={() => {
                  sfx.play('click');
                  store.setSelfLevel('confident');
                }}
              />
            </div>

            {/* Optional 3-question placement check inline */}
            <div className="rounded-[var(--radius)] border border-soft bg-sunken p-4">
              {!store.placementActive ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-sm text-ink">Not sure where to start?</span>
                    <p className="text-xs text-soft">
                      Take our 3-question check to get an instant recommendation (1 min).
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      sfx.play('click');
                      store.setPlacementActive(true);
                    }}
                    className="text-xs"
                  >
                    Take Check
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between border-b border-soft pb-2">
                    <span className="font-bold text-sm text-primary">
                      Placement Check ({Object.keys(store.placementAnswers).length}/
                      {placementQuestions.length} answered)
                    </span>
                    <button
                      type="button"
                      onClick={() => store.setPlacementActive(false)}
                      className="text-xs text-soft hover:text-ink underline"
                    >
                      Hide Check
                    </button>
                  </div>

                  {placementQuestions.map((q, idx) => (
                    <div key={q.id} className="grid gap-2 text-xs">
                      <p className="font-bold text-ink">
                        {idx + 1}. {q.prompt}
                      </p>
                      <pre className="rounded bg-surface p-2 font-mono overflow-x-auto border border-soft">
                        {q.codeSnippet}
                      </pre>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {q.options.map((opt) => {
                          const isPicked = store.placementAnswers[q.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                sfx.play('click');
                                store.setPlacementAnswer(q.id, opt.id);
                              }}
                              className={`p-2 rounded text-left font-mono border transition-all ${
                                isPicked
                                  ? 'border-primary bg-primary text-on-primary'
                                  : 'border-soft bg-surface text-ink hover:border-control'
                              }`}
                            >
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {Object.keys(store.placementAnswers).length === placementQuestions.length && (
                    <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-soft pt-3">
                      {store.suggestedLevel ? (
                        <div className="text-sm">
                          <span>We suggest: </span>
                          <span className="font-bold text-primary capitalize">
                            {store.suggestedLevel}
                          </span>
                        </div>
                      ) : (
                        <Button variant="primary" onClick={handleRunPlacementCheck}>
                          Calculate Suggestion
                        </Button>
                      )}

                      {store.suggestedLevel && (
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            onClick={() => {
                              sfx.play('click');
                              store.setSelfLevel(store.suggestedLevel!);
                              store.setPlacementActive(false);
                            }}
                          >
                            Accept Suggestion
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* STEP 4: YOUR COACH & PREFERENCES */}
        {store.step === 4 && (
          <section aria-labelledby="step4-title" className="grid gap-6">
            <div>
              <h2 id="step4-title" className="text-xl font-bold text-ink">
                Your coach & retro style
              </h2>
              <p className="text-sm text-soft">
                Configure Socrates language, your visual atmosphere, and leaderboard privacy.
              </p>
            </div>

            {/* Coach Language */}
            <div className="grid gap-2">
              <span className="t-label">Coach Language</span>
              <div className="flex gap-3">
                <Button
                  aria-pressed={store.coachLang === 'en'}
                  variant={store.coachLang === 'en' ? 'primary' : 'secondary'}
                  onClick={() => {
                    sfx.play('click');
                    store.setCoachLang('en');
                  }}
                  className="flex-1"
                >
                  English
                </Button>
                <Button
                  aria-pressed={store.coachLang === 'fr'}
                  variant={store.coachLang === 'fr' ? 'primary' : 'secondary'}
                  onClick={() => {
                    sfx.play('click');
                    store.setCoachLang('fr');
                  }}
                  className="flex-1"
                >
                  Français
                </Button>
              </div>
            </div>

            {/* Retro Style Level with live preview */}
            <div className="grid gap-2">
              <span className="t-label">Retro Style Atmosphere</span>
              <div className="grid grid-cols-3 gap-2">
                {(['clean', 'balanced', 'arcade'] as RetroLevel[]).map((level) => {
                  const isSelected = store.retroLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        sfx.play('click');
                        store.setRetroLevel(level);
                        settings.setRetroLevel(level);
                      }}
                      className={`p-3 rounded-[var(--radius)] border text-center transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-soft bg-surface hover:bg-sunken'
                      }`}
                    >
                      <span className="t-label block capitalize">{level}</span>
                      <span className="text-[11px] text-soft mt-1 block">
                        {level === 'clean' && 'Plain Atkinson, no pixel'}
                        {level === 'balanced' && 'Pixel logo & rank'}
                        {level === 'arcade' && 'Full arcade retro'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Hint Ladder Preview */}
            <div className="rounded-[var(--radius)] border border-soft bg-sunken p-4">
              <span className="t-label block mb-2">Interactive Hint Ladder Preview</span>
              <p className="text-xs text-soft mb-3">
                Click each rung to discover what Socrates provides as you climb:
              </p>

              <div className="flex flex-col gap-1.5 mb-3">
                {LADDER_DEMO_RUNGS.map((rung) => {
                  const isSelected = selectedLadderDemoRung === rung.rung;
                  return (
                    <button
                      key={rung.rung}
                      type="button"
                      onClick={() => {
                        sfx.play('step');
                        setSelectedLadderDemoRung(rung.rung);
                      }}
                      className={`flex items-center justify-between p-2 rounded text-xs text-left transition-all ${
                        isSelected
                          ? 'bg-primary text-on-primary font-bold shadow-sm'
                          : 'bg-surface text-ink hover:bg-surface-sunken'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {rung.rung === 1 && <IconThink size={16} className={isSelected ? 'text-on-primary' : 'text-primary'} />}
                        {rung.rung === 2 && <IconHint size={16} className={isSelected ? 'text-on-primary' : 'text-primary'} />}
                        {rung.rung === 3 && <IconExplain size={16} className={isSelected ? 'text-on-primary' : 'text-primary'} />}
                        {rung.rung === 4 && <IconExample size={16} className={isSelected ? 'text-on-primary' : 'text-primary'} />}
                        {rung.rung === 5 && <IconReveal size={16} className={isSelected ? 'text-on-primary' : 'text-primary'} />}
                        <span className="font-mono font-bold">Rung {rung.rung}:</span>
                        <span>{rung.name}</span>
                      </div>
                      <span className="rounded bg-xp px-1.5 py-0.5 text-on-xp font-bold">
                        {rung.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Rung explanation */}
              <div className="rounded bg-surface p-3 text-xs text-ink border border-soft">
                <span className="font-bold text-primary block mb-1">
                  Rung {selectedLadderDemoRung}:{' '}
                  {LADDER_DEMO_RUNGS[selectedLadderDemoRung - 1]?.name}
                </span>
                <p className="text-soft leading-relaxed">
                  {LADDER_DEMO_RUNGS[selectedLadderDemoRung - 1]?.desc}
                </p>
              </div>
            </div>

            {/* Leaderboard & Sound toggles */}
            <div className="grid gap-3 border-t border-soft pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={store.showOnLeaderboard}
                  onChange={(e) => store.setShowOnLeaderboard(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-control text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-bold text-sm text-ink">Show me on the leaderboard</span>
                  <p className="text-xs text-soft">
                    Only your initials ({store.initials}) and chosen avatar are shown. No email or tracking.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={store.sound}
                  onChange={(e) => {
                    store.setSound(e.target.checked);
                    settings.setSound(e.target.checked);
                    if (e.target.checked) sfx.play('pass');
                  }}
                  className="mt-1 h-4 w-4 rounded border-control text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-bold text-sm text-ink">Sound effects (WebAudio Synth)</span>
                  <p className="text-xs text-soft">
                    Crisp retro audio for rungs, tests, and victories.
                  </p>
                </div>
              </label>
            </div>
          </section>
        )}

        {/* STEP 5: READY */}
        {store.step === 5 && (
          <section aria-labelledby="step5-title" className="grid gap-6 text-center">
            <div>
              <div className="flex items-center justify-center mb-3">
                <div className="h-16 w-16 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shadow-md">
                  <Avatar seed={store.avatar} size={44} />
                </div>
              </div>
              <h2 id="step5-title" className="text-2xl font-bold text-ink">
                You are ready to think!
              </h2>
              <p className="text-sm text-soft">
                Here is your player configuration for this campaign.
              </p>
            </div>

            <div className="rounded-[var(--radius)] border-2 border-line bg-sunken p-6 max-w-md mx-auto w-full text-left grid gap-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-soft pb-2">
                <span className="text-xs text-soft uppercase font-bold">Player</span>
                <div className="flex items-center gap-2">
                  <Avatar seed={store.avatar} size={24} />
                  <span className="t-logo text-ink font-bold">{store.initials}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-soft pb-2">
                <span className="text-xs text-soft uppercase font-bold">Selected Track</span>
                <span className="font-bold text-ink capitalize">
                  {store.courseId === 'javascript' ? 'JavaScript' : 'Python'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-soft pb-2">
                <span className="text-xs text-soft uppercase font-bold">Starting Level</span>
                <span className="font-bold text-ink capitalize">{store.selfLevel}</span>
              </div>

              <div className="flex items-center justify-between border-b border-soft pb-2">
                <span className="text-xs text-soft uppercase font-bold">Coach Language</span>
                <span className="font-bold text-ink uppercase">{store.coachLang}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-soft uppercase font-bold">Atmosphere</span>
                <span className="font-bold text-ink capitalize">{store.retroLevel}</span>
              </div>
            </div>

            <p className="text-xs text-soft">
              Remember: Socrates will encourage you to reason through problems.
              The less help you request, the higher your autonomy score!
            </p>
          </section>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 border-t border-soft pt-6 mt-6">
          {store.step > 1 ? (
            <Button onClick={handleBack}>Back</Button>
          ) : (
            <Button onClick={() => navigate('/')}>Cancel</Button>
          )}

          {store.step < 5 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={
                (store.step === 1 && !isStep1Valid) ||
                (store.step === 2 && !isStep2Valid) ||
                (store.step === 3 && !isStep3Valid)
              }
            >
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={handleFinish} className="px-6 py-2.5 text-base">
              Start Campaign →
            </Button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Onboarding;
