import { Players, UserInputService, StarterGui, RunService, ReplicatedStorage } from "@rbxts/services";

// Create the pet selection UI
const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

// Create the selection screen
const selectionScreen = new Instance("ScreenGui");
selectionScreen.Name = "PetSelection";
selectionScreen.Parent = playerGui;

const mainFrame = new Instance("Frame");
mainFrame.Name = "MainFrame";
mainFrame.Size = new UDim2(0, 600, 0, 400);
mainFrame.Position = new UDim2(0.5, -300, 0.5, -200);
mainFrame.BackgroundColor3 = new Color3(0.1, 0.1, 0.2);
mainFrame.Parent = selectionScreen;

// Title
const title = new Instance("TextLabel");
title.Name = "Title";
title.Size = new UDim2(1, 0, 0, 50);
title.Position = new UDim2(0, 0, 0, 10);
title.Text = "Choose Your Magical Pet!";
title.TextScaled = true;
title.TextColor3 = new Color3(1, 1, 1);
title.BackgroundTransparency = 1;
title.Parent = mainFrame;

// Pet selection buttons
const pets = [
	{
		name: "Batcat",
		description: "A cute cat with magical wings",
		color: new Color3(0.4, 0.2, 0.6),
		icon: "🐱",
	},
	{
		name: "Multicorn",
		description: "A unicorn with random magical horns",
		color: new Color3(0.8, 0.2, 0.8),
		icon: "🦄",
	},
	{
		name: "Drablox",
		description: "A tiny dragon with big dreams",
		color: new Color3(0.8, 0.2, 0.2),
		icon: "🐉",
	},
];

pets.forEach((pet, index) => {
	const button = new Instance("TextButton");
	button.Name = pet.name;
	button.Size = new UDim2(0.9, 0, 0, 80);
	button.Position = new UDim2(0.05, 0, 0.3 + index * 0.2, 0);
	button.Text = `${pet.icon} ${pet.name}\n${pet.description}`;
	button.TextScaled = true;
	button.BackgroundColor3 = pet.color;
	button.TextColor3 = new Color3(1, 1, 1);
	button.Parent = mainFrame;

	button.MouseButton1Click.Connect(() => {
		// Hide selection screen
		selectionScreen.Enabled = false;
		// Send pet selection to server
		const petSelectionEvent = ReplicatedStorage.WaitForChild("PetSelection") as RemoteEvent;
		petSelectionEvent.FireServer(pet.name);
		// Create the pet UI
		createPetUI(pet.name);
	});
});

// Function to create the pet UI (moved from original code)
function createPetUI(petType: string) {
	const screenGui = new Instance("ScreenGui");
	screenGui.Name = "PetUI";
	screenGui.Parent = playerGui;

	const mainFrame = new Instance("Frame");
	mainFrame.Name = "MainFrame";
	mainFrame.Size = new UDim2(0, 200, 0, 100);
	mainFrame.Position = new UDim2(0, 20, 1, -120);
	mainFrame.BackgroundColor3 = new Color3(0.2, 0.2, 0.2);
	mainFrame.Parent = screenGui;

	// Create hunger bar
	const hungerBar = new Instance("Frame");
	hungerBar.Name = "HungerBar";
	hungerBar.Size = new UDim2(1, -20, 0, 20);
	hungerBar.Position = new UDim2(0, 10, 0, 10);
	hungerBar.BackgroundColor3 = new Color3(0.5, 0.5, 0.5);
	hungerBar.Parent = mainFrame;

	const hungerFill = new Instance("Frame");
	hungerFill.Name = "HungerFill";
	hungerFill.Size = new UDim2(1, 0, 1, 0);
	hungerFill.BackgroundColor3 = new Color3(0, 1, 0);
	hungerFill.Parent = hungerBar;

	// Create feed button
	const feedButton = new Instance("TextButton");
	feedButton.Name = "FeedButton";
	feedButton.Size = new UDim2(0.8, 0, 0, 30);
	feedButton.Position = new UDim2(0.1, 0, 0.5, 0);
	feedButton.Text = `Feed ${petType}`;
	feedButton.BackgroundColor3 = new Color3(0.4, 0.4, 0.8);
	feedButton.Parent = mainFrame;

	// Pet hunger system
	let hunger = 100;
	const maxHunger = 100;

	// Update hunger bar
	function updateHungerBar() {
		hungerFill.Size = new UDim2(hunger / maxHunger, 0, 1, 0);
		hungerFill.BackgroundColor3 = new Color3(1 - hunger / maxHunger, hunger / maxHunger, 0);
	}

	// Feed the pet
	feedButton.MouseButton1Click.Connect(() => {
		if (hunger < maxHunger) {
			hunger = math.min(hunger + 20, maxHunger);
			updateHungerBar();
		}
	});

	// Decrease hunger over time
	RunService.Heartbeat.Connect((dt: number) => {
		hunger = math.max(0, hunger - dt * 0.1);
		updateHungerBar();
	});
}
