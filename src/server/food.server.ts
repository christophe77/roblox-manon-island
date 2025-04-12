import { Workspace, ReplicatedStorage } from "@rbxts/services";

// Create a RemoteEvent for food collection
const foodCollectionEvent = new Instance("RemoteEvent");
foodCollectionEvent.Name = "CollectFood";
foodCollectionEvent.Parent = ReplicatedStorage;

// Configuration for food spawning
const FOOD_SPAWN_INTERVAL = 30; // Spawn new food every 30 seconds
const MAX_FOOD_ITEMS = 10; // Maximum number of food items on the map
const SPAWN_RADIUS = 50; // Radius around spawn point to place food

// Store active food items
const activeFoodItems = new Set<Model>();

// Function to create a magical rainbow food item
function createFoodItem(): Model {
	const food = new Instance("Model");
	food.Name = "MagicalRainbow";

	// Create the main rainbow part
	const rainbow = new Instance("Part");
	rainbow.Name = "Rainbow";
	rainbow.Size = new Vector3(1, 0.2, 1);
	rainbow.Shape = Enum.PartType.Cylinder;
	rainbow.Orientation = new Vector3(0, 0, 90);
	rainbow.BrickColor = new BrickColor("Hot pink");
	rainbow.Material = Enum.Material.Neon;
	rainbow.CanCollide = false;
	rainbow.Parent = food;

	// Add rainbow particles
	const particles = new Instance("ParticleEmitter");
	particles.Name = "RainbowParticles";
	particles.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, new Color3(1, 0, 0)), // Red
		new ColorSequenceKeypoint(0.2, new Color3(1, 0.5, 0)), // Orange
		new ColorSequenceKeypoint(0.4, new Color3(1, 1, 0)), // Yellow
		new ColorSequenceKeypoint(0.6, new Color3(0, 1, 0)), // Green
		new ColorSequenceKeypoint(0.8, new Color3(0, 0, 1)), // Blue
		new ColorSequenceKeypoint(1, new Color3(0.5, 0, 0.5)), // Purple
	]);
	particles.Size = new NumberSequence([new NumberSequenceKeypoint(0, 0.5), new NumberSequenceKeypoint(1, 0)]);
	particles.Rate = 50;
	particles.Speed = new NumberRange(2, 4);
	particles.Lifetime = new NumberRange(0.5, 1);
	particles.Parent = rainbow;

	// Add a touch detector
	const touchDetector = new Instance("Part");
	touchDetector.Name = "TouchDetector";
	touchDetector.Size = new Vector3(2, 2, 2);
	touchDetector.Transparency = 1;
	touchDetector.CanCollide = false;
	touchDetector.Parent = food;

	// Add a touch connection
	touchDetector.Touched.Connect((part) => {
		const character = part.Parent;
		if (character && character.IsA("Model") && character.FindFirstChild("Humanoid")) {
			foodCollectionEvent.FireClient(character.Parent as Player);
			food.Destroy();
			activeFoodItems.delete(food);
		}
	});

	return food;
}

// Function to spawn food at a random position
function spawnFood() {
	if (activeFoodItems.size() >= MAX_FOOD_ITEMS) return;

	const food = createFoodItem();
	const spawnPoint = Workspace.FindFirstChild("SpawnPoint");
	if (spawnPoint && spawnPoint.IsA("BasePart")) {
		const randomAngle = math.random() * math.pi * 2;
		const randomRadius = math.random() * SPAWN_RADIUS;
		const offset = new Vector3(math.cos(randomAngle) * randomRadius, 0, math.sin(randomAngle) * randomRadius);
		food.PivotTo(spawnPoint.CFrame.add(offset));
	}
	food.Parent = Workspace;
	activeFoodItems.add(food);
}

// Start spawning food
task.spawn(() => {
	const shouldContinue = true;
	while (shouldContinue) {
		spawnFood();
		task.wait(FOOD_SPAWN_INTERVAL);
	}
});

// Export the food collection event
export = {
	foodCollectionEvent,
};
