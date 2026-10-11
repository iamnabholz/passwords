const SOUND_VOLUME = 0.08;

type SoundEffect = 'generate' | 'action' | 'beep' | 'print';

type Note = {
	pitch: number;
	start: number;
	duration: number;
	wave: OscillatorType;
	level: number;
	lowpass?: number;
};

const ACTION_PATTERNS = [
	[329.63, 493.88],
	[392, 523.25],
	[440, 659.25],
	[523.25, 392]
];

const GENERATE_NOTES: Note[] = [360, 240, 470].map((pitch, index) => ({
	pitch,
	start: [0, 0.055, 0.12][index],
	duration: 0.05,
	wave: 'square',
	level: 0.56
}));

const BEEP_NOTES: Note[] = [
	{
		pitch: 880,
		start: 0,
		duration: 0.07,
		wave: 'sine',
		level: 0.7
	}
];

let audioContext: AudioContext | undefined;
let lastActionPattern = -1;

function randomBetween(min: number, max: number) {
	return min + Math.random() * (max - min);
}

function getNotes(effect: SoundEffect): Note[] {
	if (effect === 'generate') return GENERATE_NOTES;
	if (effect === 'beep') return BEEP_NOTES;

	if (effect === 'print') {
		return Array.from({ length: 25 }, (_, index): Note => {
			const accented = index % 5 === 0;

			return {
				pitch: (index % 2 === 0 ? 180 : 320) + randomBetween(-20, 20),
				start: index * 0.04 + randomBetween(0, 0.006),
				duration: accented ? 0.025 : 0.015,
				wave: 'square',
				level: accented ? 0.4 : randomBetween(0.2, 0.3),
				lowpass: 1400
			};
		});
	}

	const choices = ACTION_PATTERNS.map((_, index) => index).filter(
		(index) => index !== lastActionPattern
	);

	const choice = choices[Math.floor(Math.random() * choices.length)];
	lastActionPattern = choice;

	return ACTION_PATTERNS[choice].map((pitch, index) => ({
		pitch,
		start: index * 0.035,
		duration: 0.05,
		wave: index === 0 ? 'square' : 'triangle',
		level: index === 0 ? 0.65 : 1,
		lowpass: 1800
	}));
}

export async function playSound(effect: SoundEffect) {
	if (typeof window === 'undefined') return;

	try {
		if (!audioContext || audioContext.state === 'closed') {
			audioContext = new AudioContext();
		}

		const context = audioContext;

		if (context.state !== 'running') {
			await context.resume();
		}

		if (context !== audioContext || context.state !== 'running') return;

		// Vary the whole effect together so the notes retain their character.
		const detune = randomBetween(-6, 6);
		const volumeScale = randomBetween(0.95, 1.05);
		const timingScale = randomBetween(0.97, 1.03);
		const now = context.currentTime;

		for (const note of getNotes(effect)) {
			const start = now + note.start * timingScale;
			const duration = note.duration * timingScale;
			const level = SOUND_VOLUME * note.level * volumeScale;

			const oscillator = context.createOscillator();
			const gain = context.createGain();
			const filter = note.lowpass ? context.createBiquadFilter() : undefined;

			oscillator.type = note.wave;
			oscillator.frequency.value = note.pitch;
			oscillator.detune.value = detune;

			gain.gain.setValueAtTime(0, start);
			gain.gain.linearRampToValueAtTime(level, start + 0.003);
			gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

			if (filter) {
				filter.type = 'lowpass';
				filter.frequency.value = note.lowpass!;
				filter.Q.value = 0.5;

				oscillator.connect(filter);
				filter.connect(gain);
			} else {
				oscillator.connect(gain);
			}

			gain.connect(context.destination);

			oscillator.onended = () => {
				oscillator.disconnect();
				filter?.disconnect();
				gain.disconnect();
			};

			oscillator.start(start);
			oscillator.stop(start + duration);
		}
	} catch {
		// Optional audio must never interrupt the app.
	}
}

export function disposeSounds() {
	const context = audioContext;
	audioContext = undefined;
	lastActionPattern = -1;

	if (context && context.state !== 'closed') {
		void context.close().catch(() => {});
	}
}
