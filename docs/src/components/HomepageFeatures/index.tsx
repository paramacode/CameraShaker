import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Procedural & Realistic',
    description: (
      <>
        Perlin-noise driven shakes that feel organic, not random.
        Control <strong>magnitude</strong>, <strong>roughness</strong>, and per-axis
        influence for position, rotation, and FOV zoom independently.
      </>
    ),
  },
  {
    title: 'One-Shot & Sustained',
    description: (
      <>
        Fire-and-forget impacts for explosions and hits, or sustained
        effects for earthquakes and handheld sway. Smooth fade-in and
        fade-out with full timing control.
      </>
    ),
  },
  {
    title: 'Zero Config, Full Control',
    description: (
      <>
        Works instantly with <code>Workspace.CurrentCamera</code> out of the box.
        Need custom behavior? Provide your own callback to apply shakes
        to anything, models, UI, or custom rigs.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}