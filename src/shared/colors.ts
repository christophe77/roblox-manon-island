// Array of magical and kid-friendly colors for pets
export const magicalColors = [
	new BrickColor("Bright violet"), // Magical purple
	new BrickColor("Toothpaste"), // Magical cyan
	new BrickColor("Hot pink"), // Fun pink
	new BrickColor("New Yeller"), // Bright yellow
	new BrickColor("Lime green"), // Fun green
	new BrickColor("Really blue"), // Deep blue
	new BrickColor("Bright orange"), // Fun orange
	new BrickColor("Magenta"), // Magical pink
	new BrickColor("Cyan"), // Light blue
	new BrickColor("Bright green"), // Cheerful green
	new BrickColor("Lavender"), // Soft purple
	new BrickColor("Pastel Blue"), // Soft blue
	new BrickColor("Pastel violet"), // Soft violet
	new BrickColor("Pastel yellow"), // Soft yellow
	new BrickColor("Pink"), // Light pink
];

// Function to get a random color from the array
export function getRandomMagicalColor(): BrickColor {
	const randomIndex = math.random(0, magicalColors.size() - 1);
	return magicalColors[randomIndex];
}
