import pyaudio
import numpy as np
import aubio

# Define the parameters
FORMAT = pyaudio.paFloat32  # Change the format to float32
CHANNELS = 1  # Mono
RATE = 44100  # Sample rate (Hz)
CHUNK = 2048  # Size of each audio chunk
RECORD_SECONDS = 20  # Recording duration (in seconds)

# Define the expected sequence of notes
expected_notes = ["C5", "D5", "G4"]

# Initialize PyAudio
audio = pyaudio.PyAudio()

# Open the microphone stream
stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

# Create aubio pitch detection object
pDetection = aubio.pitch("yin", CHUNK, CHUNK, RATE)

# Initialize variables to keep track of detected notes
notes = []
sequence_of_notes = []
found_sequence = False

# Record audio for the specified duration
previous_note = None  # To keep track of the previous note
for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
    data = stream.read(CHUNK)
    audio_data = np.frombuffer(data, dtype=np.float32)  # Convert to float32

    # Perform pitch detection
    pitch = pDetection(audio_data)[0]

    if pitch >= 200:  # Only process notes with frequency >= 200 Hertz
        note = aubio.freq2note(pitch)
        # Filter out notes containing '#' (sharps)
        if '#' not in note:
            notes.append(note)  # Add the detected note to the list
            print(note)

            # Check if the detected note is part of the expected sequence
            if note in expected_notes:
                # Check if it's the same as the previous note
                if note == previous_note:
                    continue  # If the current note is the same as the previous note, skip it

                sequence_of_notes.append(note)
                previous_note = note

                # Check if the sequence of expected notes has been found
                if all(expected_note in sequence_of_notes for expected_note in expected_notes):
                    found_sequence = True
                    break
            else:
                previous_note = None  # Reset previous_note for notes that are not part of the sequence

# Close the audio stream
stream.stop_stream()
stream.close()

# Terminate PyAudio
audio.terminate()

# Flip the page if the sequence of expected notes has been found
if found_sequence:
    print("FLIP THE PAGE")
