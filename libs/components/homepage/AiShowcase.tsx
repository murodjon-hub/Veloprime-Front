import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { Sparkles, Zap, Map, BookOpen } from 'lucide-react';

const DEMO_EXCHANGES = [
	{
		prompt: 'Best road bikes under $1,500',
		response: "Great choice! For that budget I'd recommend checking our Trek Domane and Cannondale Synapse listings — both offer excellent value with aluminum frames and reliable Shimano groupsets. The Domane is smoother on rough roads.",
		hasCards: true,
	},
	{
		prompt: "I'm a beginner, what bike should I get?",
		response: "Welcome to cycling! A hybrid bike is the perfect starting point — versatile enough for city streets and light trails. Look for a medium frame (M or L), front suspension, and 21-speed gearing. VeloPrime has several great options under $800.",
		hasCards: true,
	},
	{
		prompt: 'Any upcoming group rides near me?',
		response: "There are 3 upcoming events this month — a 45km city tour, a mountain trail ride in the hills, and a beginner-friendly 20km coastal route. All are open to registration right now!",
		hasCards: false,
	},
	{
		prompt: 'Carbon vs aluminum frame — which is better?',
		response: "Carbon is lighter and absorbs road vibration better — ideal for performance riders. Aluminum is stiffer, more affordable, and nearly as fast. For most cyclists, a quality aluminum frame delivers 90% of the experience at half the cost.",
		hasCards: false,
	},
];

const FEATURES = [
	{ icon: <Zap size={16} />,      label: 'Instant Recommendations',  desc: 'Get bike picks matched to your budget and riding style' },
	{ icon: <Map size={16} />,       label: 'Event Discovery',           desc: 'Find group rides, races, and cycling tours near you'   },
	{ icon: <BookOpen size={16} />, label: 'Cycling Expertise',         desc: 'Ask anything — specs, comparisons, beginner advice'   },
	{ icon: <Sparkles size={16} />, label: 'Live Marketplace Data',     desc: 'Recommendations pulled from real VeloPrime listings'  },
];

const QUICK_PROMPTS = [
	'Best road bikes under $1,500',
	'Beginner MTB recommendations',
	'Upcoming cycling events',
	'Compare carbon vs aluminum',
];

export default function AiShowcase() {
	const router  = useRouter();
	const [idx,   setIdx]   = useState(0);
	const [phase, setPhase] = useState<'prompt' | 'response'>('prompt');

	useEffect(() => {
		let t: ReturnType<typeof setTimeout>;
		if (phase === 'prompt')   t = setTimeout(() => setPhase('response'), 1800);
		else                       t = setTimeout(() => { setPhase('prompt'); setIdx((i) => (i + 1) % DEMO_EXCHANGES.length); }, 3800);
		return () => clearTimeout(t);
	}, [phase, idx]);

	const ex = DEMO_EXCHANGES[idx];

	return (
		<section className="ai-showcase">
			<div className="ai-showcase__inner">

				{/* LEFT — copy */}
				<div className="ai-showcase__copy">
					<span className="ai-showcase__eyebrow">
						<Sparkles size={12} /> AI-Powered
					</span>
					<h2 className="ai-showcase__title">Your AI Cycling<br />Concierge</h2>
					<p className="ai-showcase__sub">
						Get instant bike recommendations, expert cycling advice, event discovery,
						and marketplace guidance — all in one intelligent assistant.
					</p>

					<div className="ai-showcase__features">
						{FEATURES.map((f) => (
							<div key={f.label} className="ai-showcase__feature">
								<div className="ai-showcase__feature-icon">{f.icon}</div>
								<div>
									<p className="ai-showcase__feature-label">{f.label}</p>
									<p className="ai-showcase__feature-desc">{f.desc}</p>
								</div>
							</div>
						))}
					</div>

					<div className="ai-showcase__prompts">
						{QUICK_PROMPTS.map((p) => (
							<button
								key={p}
								className="ai-showcase__prompt-chip"
								onClick={() => router.push('/?ai=open')}
							>
								{p}
							</button>
						))}
					</div>
				</div>

				{/* RIGHT — live demo panel */}
				<div className="ai-showcase__demo">
					<div className="ai-showcase__demo-header">
						<div className="ai-showcase__demo-avatar">VP</div>
						<div>
							<p className="ai-showcase__demo-name">VeloPrime AI</p>
							<p className="ai-showcase__demo-status">
								<span className="ai-showcase__demo-dot" />Online
							</p>
						</div>
						<div className="ai-showcase__demo-dots">
							<span /><span /><span />
						</div>
					</div>

					<div className="ai-showcase__demo-body">
						<AnimatePresence mode="wait">
							<motion.div
								key={`${idx}-${phase}`}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{    opacity: 0, y: -8 }}
								transition={{ duration: 0.3 }}
							>
								{/* User prompt */}
								<div className="ai-showcase__demo-user">
									<div className="ai-showcase__demo-user-bubble">{ex.prompt}</div>
								</div>

								{/* AI response */}
								{phase === 'response' && (
									<div className="ai-showcase__demo-ai">
										<div className="ai-showcase__demo-ai-avatar">VP</div>
										<div className="ai-showcase__demo-ai-bubble">
											<p>{ex.response}</p>
											{ex.hasCards && (
												<div className="ai-showcase__demo-cards">
													{[0, 1].map((i) => (
														<div key={i} className="ai-showcase__demo-card">
															<div className="ai-showcase__demo-card-img" />
															<div className="ai-showcase__demo-card-line" />
															<div className="ai-showcase__demo-card-line short" />
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								)}

								{phase === 'prompt' && (
									<div className="ai-showcase__demo-ai">
										<div className="ai-showcase__demo-ai-avatar">VP</div>
										<div className="ai-showcase__demo-typing">
											<span /><span /><span />
										</div>
									</div>
								)}
							</motion.div>
						</AnimatePresence>
					</div>

					<div className="ai-showcase__demo-input">
						<span>Ask about bikes, events, gear…</span>
					</div>
				</div>

			</div>
		</section>
	);
}
