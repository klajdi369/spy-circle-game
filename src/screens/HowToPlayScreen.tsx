import { Eye, Lightbulb, Shield } from 'lucide-react';
import styles from './HowToPlayScreen.module.css';

export function HowToPlayScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>How to Play</h1>
        <p className={styles.subtitle}>A game of secrets, questions, and deduction</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Eye className={styles.sectionIcon} size={20} />
          Overview
        </h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div>
              <div className={styles.stepTitle}>Configure the game</div>
              <div className={styles.stepDesc}>
                Choose the number of players and spies, set a discussion timer,
                and pick a word category.
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div>
              <div className={styles.stepTitle}>Pass the device privately</div>
              <div className={styles.stepDesc}>
                Each player takes a turn holding the device. The screen shows a
                handoff message so others know to look away.
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div>
              <div className={styles.stepTitle}>Reveal your role</div>
              <div className={styles.stepDesc}>
                Tap the role card to reveal your role. Regular players see the
                secret word. Spies see a message telling them to blend in. Tap
                the card again to hide it and pass the phone.
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div>
              <div className={styles.stepTitle}>Ask questions</div>
              <div className={styles.stepDesc}>
                After everyone has seen their role, start the timer. Ask each
                other questions to figure out who the spies are — without
                saying the secret word directly.
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div>
              <div className={styles.stepTitle}>Identify the spy</div>
              <div className={styles.stepDesc}>
                The group discusses and votes. Suspect someone? The spies try to
                stay hidden while figuring out the word.
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div>
              <div className={styles.stepTitle}>Spy&apos;s last chance</div>
              <div className={styles.stepDesc}>
                If a spy is caught, they get one chance to guess the secret
                word. A correct guess can still win them the game!
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div>
              <div className={styles.stepTitle}>Reveal the results</div>
              <div className={styles.stepDesc}>
                The app reveals the secret word, the category, and the identity
                of every spy.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Lightbulb className={styles.sectionIcon} size={20} />
          Tips for Regular Players
        </h2>
        <div className={styles.tipCard}>
          <div className={styles.tipTitle}>Keep hints vague</div>
          <div className={styles.tipText}>
            Use broad hints that a regular player would understand but a spy
            would struggle to interpret. &ldquo;It&apos;s something you find outdoors&rdquo;
            is better than &ldquo;It has four legs and barks.&rdquo;
          </div>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipTitle}>Watch for hesitation</div>
          <div className={styles.tipText}>
            Spies often pause before answering because they need to think
            about what makes sense. Listen for answers that feel generic or
            disconnected.
          </div>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipTitle}>Ask follow-ups</div>
          <div className={styles.tipText}>
            Don&apos;t accept one-word answers. Ask &ldquo;Why do you think that?&rdquo; or
            &ldquo;Can you be more specific?&rdquo; to put pressure on spies.
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Eye className={styles.sectionIcon} size={20} />
          Tips for Spies
        </h2>
        <div className={styles.tipCard}>
          <div className={styles.tipTitle}>Blend in confidently</div>
          <div className={styles.tipText}>
            Answer quickly and with conviction. Long pauses make you look
            suspicious. If you don&apos;t know, make a reasonable guess based on
            what others have said.
          </div>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipTitle}>Listen and learn</div>
          <div className={styles.tipText}>
            Pay close attention to other players&apos; answers. As more people
            speak, the secret word becomes easier to identify. Pick up on
            patterns and common themes.
          </div>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipTitle}>Deflect suspicion</div>
          <div className={styles.tipText}>
            If someone accuses you, stay calm. Turn the question around:
            &ldquo;What makes you say that?&rdquo; or &ldquo;I was just about to ask you the
            same thing.&rdquo;
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Shield className={styles.sectionIcon} size={20} />
          Playing with Multiple Spies
        </h2>
        <div className={styles.tipCard}>
          <div className={styles.tipText}>
            With multiple spies, they don&apos;t know who each other are. This adds
            an extra layer of strategy — spies must identify their allies while
            avoiding detection. Pay attention to who seems to be struggling to
            give specific answers.
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Shield className={styles.sectionIcon} size={20} />
          Privacy When Passing the Phone
        </h2>
        <div className={styles.tipCard}>
          <div className={styles.tipText}>
            Always hand the device face-down when passing between players. The
            app shows neutral screens between turns. Encourage everyone to look
            away from the screen during handoffs — the fun depends on keeping
            roles secret until the reveal!
          </div>
        </div>
      </div>
    </div>
  );
}
