import type { ComponentType } from "react";
import {
  About1,
  About2,
  About3,
  Benefits1,
  Benefits2,
  Benefits3,
  Blog1,
  Blog2,
  Blog3,
  Cta1,
  Cta2,
  Cta3,
  Faq1,
  Faq2,
  Faq3,
  Features1,
  Features2,
  Features3,
  Footer1,
  Footer2,
  Footer3,
  Hero1,
  Hero2,
  Hero3,
  Pricing1,
  Pricing2,
  Pricing3,
  Process1,
  Process2,
  Process3,
  Sponsors1,
  Sponsors2,
  Sponsors3,
  Stats1,
  Stats2,
  Stats3,
  Testimonials1,
  Testimonials2,
  Testimonials3,
} from "./section-components";

const FULL_PAGE_SETS: ComponentType[][] = [
  [
    Hero1,
    Stats1,
    About1,
    Features1,
    Process1,
    Benefits1,
    Blog1,
    Sponsors1,
    Testimonials1,
    Pricing1,
    Faq1,
    Cta1,
    Footer1,
  ],
  [
    Hero2,
    Stats2,
    About2,
    Features2,
    Process2,
    Benefits2,
    Blog2,
    Sponsors2,
    Testimonials2,
    Pricing2,
    Faq2,
    Cta2,
    Footer2,
  ],
  [
    Hero3,
    Stats3,
    About3,
    Features3,
    Process3,
    Benefits3,
    Blog3,
    Sponsors3,
    Testimonials3,
    Pricing3,
    Faq3,
    Cta3,
    Footer3,
  ],
];

function FullPage({ sections }: { sections: ComponentType[] }) {
  return (
    <>
      {sections.map((Component) => (
        <Component key={Component.name} />
      ))}
    </>
  );
}

function fullPageSet(index: 0 | 1 | 2): ComponentType[] {
  const sections = FULL_PAGE_SETS[index];
  if (!sections) {
    throw new Error(`Full page set ${index} is missing`);
  }
  return sections;
}

export function FullPage1() {
  return <FullPage sections={fullPageSet(0)} />;
}

export function FullPage2() {
  return <FullPage sections={fullPageSet(1)} />;
}

export function FullPage3() {
  return <FullPage sections={fullPageSet(2)} />;
}
