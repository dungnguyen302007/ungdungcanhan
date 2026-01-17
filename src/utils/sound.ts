// Play notification sound using Web Audio API
export const playNotificationSound = async () => {
    try {
        console.log('[Sound] Attempting to play notification sound...');

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Resume audio context if suspended (browser autoplay policy)
        if (audioContext.state === 'suspended') {
            console.log('[Sound] AudioContext suspended, resuming...');
            await audioContext.resume();
        }

        console.log('[Sound] AudioContext state:', audioContext.state);

        // Create oscillators for a pleasant bell-like sound
        const now = audioContext.currentTime;

        // First tone (higher pitch)
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();

        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(800, now);
        gainNode1.gain.setValueAtTime(0.3, now);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);

        oscillator1.start(now);
        oscillator1.stop(now + 0.3);

        // Second tone (lower pitch) - slightly delayed
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();

        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(650, now + 0.15);
        gainNode2.gain.setValueAtTime(0.25, now + 0.15);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);

        oscillator2.start(now + 0.15);
        oscillator2.stop(now + 0.45);

        console.log('[Sound] Notification sound played successfully!');

    } catch (error) {
        console.error('[Sound] Error playing notification sound:', error);
    }
};
