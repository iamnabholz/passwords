const SOUND_VOLUME = 0.08;

const soundPatterns = [
	[329.63, 493.88],
	[392, 523.25],
	[440, 659.25],
	[523.25, 392]
];

let audioContext: AudioContext | undefined;
let lastPattern = -1;

export async function playGenerateSound() {
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

		const choices = soundPatterns.map((_, index) => index).filter((index) => index !== lastPattern);

		const choice = choices[Math.floor(Math.random() * choices.length)];
		lastPattern = choice;

		const now = context.currentTime;
		const detune = Math.random() * 12 - 6;

		soundPatterns[choice].forEach((pitch, index) => {
			const start = now + index * 0.035;
			const duration = 0.05;

			const oscillator = context.createOscillator();
			const filter = context.createBiquadFilter();
			const volume = context.createGain();

			oscillator.type = index === 0 ? 'square' : 'triangle';
			oscillator.frequency.value = pitch;
			oscillator.detune.value = detune;

			// Keep the retro edge without the harsh high frequencies.
			filter.type = 'lowpass';
			filter.frequency.value = 1800;
			filter.Q.value = 0.5;

			const level = SOUND_VOLUME * (index === 0 ? 0.65 : 1);

			volume.gain.setValueAtTime(0, start);
			volume.gain.linearRampToValueAtTime(level, start + 0.003);
			volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);

			oscillator.connect(filter);
			filter.connect(volume);
			volume.connect(context.destination);

			oscillator.onended = () => {
				oscillator.disconnect();
				filter.disconnect();
				volume.disconnect();
			};

			oscillator.start(start);
			oscillator.stop(start + duration);
		});
	} catch {
		// Audio being unavailable must not interrupt the app.
	}
}

export async function playCopySound() {
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

		const now = context.currentTime;
		const oscillator = context.createOscillator();
		const volume = context.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.value = 880;

		volume.gain.setValueAtTime(0, now);
		volume.gain.linearRampToValueAtTime(SOUND_VOLUME * 0.7, now + 0.004);
		volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

		oscillator.connect(volume);
		volume.connect(context.destination);

		oscillator.onended = () => {
			oscillator.disconnect();
			volume.disconnect();
		};

		oscillator.start(now);
		oscillator.stop(now + 0.07);
	} catch {
		// Sound is optional.
	}
}

export function disposeSounds() {
	const context = audioContext;
	audioContext = undefined;
	lastPattern = -1;

	if (context && context.state !== 'closed') {
		void context.close().catch(() => {});
	}
}
