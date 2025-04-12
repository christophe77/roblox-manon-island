import { Players, RunService, Workspace } from "@rbxts/services";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

// Create the minimap UI
const minimap = new Instance("ScreenGui");
minimap.Name = "Minimap";
minimap.Parent = playerGui;

// Create the map container
const mapContainer = new Instance("Frame");
mapContainer.Name = "MapContainer";
mapContainer.Size = new UDim2(0, 200, 0, 200);
mapContainer.Position = new UDim2(1, -220, 1, -220);
mapContainer.BackgroundColor3 = new Color3(0.1, 0.1, 0.2);
mapContainer.BackgroundTransparency = 0.5;
mapContainer.Parent = minimap;

// Create the map background
const mapBackground = new Instance("Frame");
mapBackground.Name = "MapBackground";
mapBackground.Size = new UDim2(1, -20, 1, -20);
mapBackground.Position = new UDim2(0, 10, 0, 10);
mapBackground.BackgroundColor3 = new Color3(0.2, 0.2, 0.3);
mapBackground.Parent = mapContainer;

// Create the player indicator
const playerIndicator = new Instance("Frame");
playerIndicator.Name = "PlayerIndicator";
playerIndicator.Size = new UDim2(0, 8, 0, 8);
playerIndicator.BackgroundColor3 = new Color3(1, 1, 1);
playerIndicator.Parent = mapBackground;

// Create a container for food indicators
const foodIndicators = new Instance("Folder");
foodIndicators.Name = "FoodIndicators";
foodIndicators.Parent = mapBackground;

// Function to create a food indicator
function createFoodIndicator(): Frame {
	const indicator = new Instance("Frame");
	indicator.Name = "FoodIndicator";
	indicator.Size = new UDim2(0, 6, 0, 6);
	indicator.BackgroundColor3 = new Color3(1, 0, 1); // Magenta color for food
	indicator.Parent = foodIndicators;
	return indicator;
}

// Function to update positions on the minimap
function updateMinimap() {
	const character = player.Character;
	if (!character) return;

	const primaryPart = character.PrimaryPart;
	if (!primaryPart) return;

	// Update player position
	const playerPos = primaryPart.Position;
	const spawnPoint = Workspace.FindFirstChild("SpawnPoint") as BasePart;
	if (!spawnPoint) return;

	// Calculate relative positions
	const mapSize = 50; // Same as SPAWN_RADIUS
	const centerX = mapBackground.AbsoluteSize.X / 2;
	const centerY = mapBackground.AbsoluteSize.Y / 2;

	// Update player indicator
	const playerX = ((playerPos.X - spawnPoint.Position.X) / mapSize) * centerX + centerX;
	const playerZ = ((playerPos.Z - spawnPoint.Position.Z) / mapSize) * centerY + centerY;
	playerIndicator.Position = new UDim2(0, playerX - 4, 0, playerZ - 4);

	// Update food indicators
	const foods = Workspace.GetChildren().filter((child) => child.Name === "MagicalRainbow") as Model[];

	// Create or remove indicators as needed
	while (foodIndicators.GetChildren().size() < foods.size()) {
		createFoodIndicator();
	}
	while (foodIndicators.GetChildren().size() > foods.size()) {
		foodIndicators.GetChildren()[0].Destroy();
	}

	// Update food positions
	foods.forEach((food, index) => {
		const indicator = foodIndicators.GetChildren()[index] as Frame;
		const foodX = ((food.PrimaryPart!.Position.X - spawnPoint.Position.X) / mapSize) * centerX + centerX;
		const foodZ = ((food.PrimaryPart!.Position.Z - spawnPoint.Position.Z) / mapSize) * centerY + centerY;
		indicator.Position = new UDim2(0, foodX - 3, 0, foodZ - 3);
	});
}

// Update minimap every frame
RunService.Heartbeat.Connect(updateMinimap);
