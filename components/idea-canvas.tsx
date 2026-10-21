"use client";

import { useState } from "react";
import { ArrowRight, Check, Copy, RefreshCw, Sparkles, Target, Users, WandSparkles } from "lucide-react";

const ideas = [
  { audience: "Creators", goal: "Save time", title: "A calmer creator cockpit", description: "A lightweight weekly planner that turns scattered ideas into three realistic priorities.", test: "Would creators return to plan their next week?", tags: ["Workflow", "Focus", "Weekly ritual"] },
  { audience: "Creators", goal: "Build community", title: "The small-circle studio", description: "A private space for creators to exchange thoughtful feedback with a handful of peers.", test: "Would creators invite two trusted peers?", tags: ["Community", "Feedback", "Trust"] },
  { audience: "Learners", goal: "Save time", title: "Five-minute skill sprints", description: "A tiny daily lesson builder that turns a broad learning goal into one doable practice.", test: "Would learners complete a second sprint?", tags: ["Learning", "Habits", "Progress"] },
  { audience: "Learners", goal: "Build community", title: "Study buddy signals", description: "Match learners by one goal and a shared schedule, not an endless profile feed.", test: "Would learners schedule a second session?", tags: ["Accountability", "Matching", "Learning"] },
  { audience: "Small teams", goal: "Save time", title: "The decision memory", description: "A searchable log that captures what a team decided, why, and what would change its mind.", test: "Would a team find a past decision in under a minute?", tags: ["Teams", "Clarity", "Search"] },
  { audience: "Small teams", goal: "Build community", title: "A lightweight customer circle", description: "A small, recurring feedback group that gives product teams a clearer line to real users.", test: "Would members opt into another feedback round?", tags: ["Research", "Customers", "Feedback"] },
  { audience: "Creators", goal: "Save time", title: "The one-hour launch plan", description: "A guided weekly sprint that helps independent creators choose one small thing to publish and finish it.", test: "Would creators finish one planned deliverable in a week?", tags: ["Shipping", "Planning", "Momentum"] },
  { audience: "Creators", goal: "Build community", title: "The feedback exchange", description: "Pair creators for short, structured feedback sessions with clear prompts and no follower counts.", test: "Would creators book a second exchange?", tags: ["Peer review", "Community", "Craft"] },
  { audience: "Learners", goal: "Save time", title: "The learning route map", description: "A simple route planner that trims a huge topic into the next three useful lessons.", test: "Would learners finish the first recommended step?", tags: ["Focus", "Roadmap", "Learning"] },
  { audience: "Learners", goal: "Build community", title: "Quiet accountability pairs", description: "A low-pressure check-in for two learners who share a goal and want steady progress, not a public streak.", test: "Would both learners check in again next week?", tags: ["Habits", "Support", "Consistency"] },
  { audience: "Small teams", goal: "Save time", title: "The async handoff brief", description: "Turn a messy project update into a concise handoff with owners, blockers, and the next decision.", test: "Would teammates need fewer clarification messages?", tags: ["Operations", "Clarity", "Async"] },
  { audience: "Small teams", goal: "Build community", title: "Customer council, minus the ceremony", description: "A tiny rotating group of customers that reacts to one concrete product question each month.", test: "Would customers return for a second round?", tags: ["Customer voice", "Research", "Trust"] },
];

export function IdeaCanvas() {
  const [audience, setAudience] = useState("Creators");
  const [goal, setGoal] = useState("Save time");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const match = ideas.filter(item => item.audience === audience && item.goal === goal);
  const idea = match[index % match.length] ?? ideas[0];
  const cycle = () => { setIndex(value => value + 1); setCopied(false); };
  const copyPrompt = () => {
    const prompt = "Idea: " + idea.title + "\nAudience: " + idea.audience + "\nGoal: " + idea.goal + "\nConcept: " + idea.description + "\nFirst test: " + idea.test;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(prompt).then(() => setCopied(true)).catch(() => setCopied(false));
  };
  return <div className="idea-canvas">
    <div className="idea-canvas-controls">
      <div className="canvas-control-block"><label htmlFor="canvas-audience"><Users size={14}/> WHO IS IT FOR?</label><select id="canvas-audience" value={audience} onChange={event => {setAudience(event.target.value);setIndex(0);setCopied(false)}}><option>Creators</option><option>Learners</option><option>Small teams</option></select></div>
      <div className="canvas-control-block"><label htmlFor="canvas-goal"><Target size={14}/> WHAT SHOULD IMPROVE?</label><select id="canvas-goal" value={goal} onChange={event => {setGoal(event.target.value);setIndex(0);setCopied(false)}}><option>Save time</option><option>Build community</option></select></div>
      <div className="canvas-control-note"><span className="canvas-live-dot"/><span>Local interactive concept builder<br/><strong>No account or API needed</strong></span></div>
    </div>
    <div className="idea-canvas-result" key={idea.title + index}>
      <div className="canvas-result-orb"/><div className="canvas-result-top"><span><Sparkles size={14}/> A STARTING HYPOTHESIS</span><span>CONCEPT / {String((index % 6) + 1).padStart(2,"0")}</span></div>
      <div className="canvas-result-body"><div className="canvas-result-icon"><WandSparkles size={23}/></div><div><h3>{idea.title}</h3><p>{idea.description}</p></div></div>
      <div className="canvas-tags">{idea.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <div className="canvas-test-question"><span className="canvas-test-icon"><Target size={15}/></span><div><span>THE FIRST THING TO TEST</span><p>{idea.test}</p></div></div>
      <div className="canvas-actions"><button type="button" onClick={cycle} className="canvas-secondary-action"><RefreshCw size={14}/> Explore another</button><button type="button" onClick={copyPrompt} className="canvas-primary-action">{copied ? <><Check size={14}/> Copied concept</> : <><Copy size={14}/> Copy concept</>} <ArrowRight size={14}/></button></div>
    </div>
    <div className="idea-canvas-foot"><span><span className="canvas-foot-mark"/> GOOD IDEAS START AS TESTABLE QUESTIONS</span><span>EXAMPLE CONTENT · NOT A FORECAST</span></div>
  </div>;
}
