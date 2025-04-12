import { Players, Workspace, ReplicatedStorage, RunService } from "@rbxts/services";
import { getRandomMagicalColor } from "../shared/colors";

// Create a RemoteEvent for feeding pets
const feedEvent = new Instance("RemoteEvent");
feedEvent.Name = "FeedPet";
feedEvent.Parent = ReplicatedStorage;

// Create a RemoteEvent for food collection
const foodCollectionEvent = new Instance("RemoteEvent");
foodCollectionEvent.Name = "CollectFood";
foodCollectionEvent.Parent = ReplicatedStorage;

// Create a RemoteEvent for pet selection
const petSelectionEvent = new Instance("RemoteEvent");
petSelectionEvent.Name = "PetSelection";
petSelectionEvent.Parent = ReplicatedStorage;

// Pet configurations
const petConfigs = {
	Batcat: {
		size: new Vector3(1, 1, 1),
		color: new BrickColor("Royal purple"),
		special: "Wings",
	},
	Multicorn: {
		size: new Vector3(1.2, 1.2, 1.2),
		color: new BrickColor("Hot pink"),
		special: "Horns",
	},
	Drablox: {
		size: new Vector3(1.5, 1.5, 1.5),
		color: new BrickColor("Really red"),
		special: "Fire",
	},
};

// Store player data
const playerData = new Map<Player, { pet?: Model; foodCount?: number }>();

// Handle food collection
foodCollectionEvent.OnServerEvent.Connect((player) => {
	if (!playerData.has(player)) {
		playerData.set(player, { foodCount: 0 });
	}
	const data = playerData.get(player)!;
	data.foodCount = (data.foodCount || 0) + 1;
	print(`${player.Name} collected a magical rainbow! Total: ${data.foodCount}`);
});

// Handle pet selection
petSelectionEvent.OnServerEvent.Connect((player, ...args) => {
	const petType = args[0] as string;
	if (player.Character) {
		// Remove existing pet if any
		const existingPet = player.Character.FindFirstChild("Pet");
		if (existingPet) {
			existingPet.Destroy();
		}

		// Create new pet based on selection
		const config = petConfigs[petType as keyof typeof petConfigs];
		if (config) {
			const pet = new Instance("Model");
			pet.Name = "Pet";
			pet.Parent = Workspace;

			// Create main body
			const body = new Instance("Part");
			body.Name = "Body";
			body.Size = new Vector3(1.5, 1.5, 2);
			body.BrickColor = getRandomMagicalColor(); // Use random magical color
			body.Material = Enum.Material.Neon;
			body.Shape = Enum.PartType.Ball;
			body.CanCollide = false;
			body.Parent = pet;

			// Set initial position
			if (player.Character?.PrimaryPart) {
				body.Position = player.Character.PrimaryPart.Position.add(new Vector3(0, 2, -3));
			}

			// Create head
			const head = new Instance("Part");
			head.Name = "Head";
			head.Size = new Vector3(1, 1, 1);
			head.BrickColor = body.BrickColor; // Use same color as body
			head.Material = Enum.Material.Neon;
			head.Shape = Enum.PartType.Ball;
			head.CanCollide = false;
			head.Parent = pet;

			// Position head above body
			const headWeld = new Instance("Weld");
			headWeld.Part0 = body;
			headWeld.Part1 = head;
			headWeld.C0 = new CFrame(0, 1.25, 0);
			headWeld.Parent = head;

			// Add eyes
			const leftEye = new Instance("Part");
			leftEye.Name = "LeftEye";
			leftEye.Size = new Vector3(0.2, 0.2, 0.2);
			leftEye.BrickColor = new BrickColor("Institutional white");
			leftEye.Material = Enum.Material.Neon;
			leftEye.Shape = Enum.PartType.Ball;
			leftEye.CanCollide = false;
			leftEye.Parent = head;

			const rightEye = new Instance("Part");
			rightEye.Name = "RightEye";
			rightEye.Size = new Vector3(0.2, 0.2, 0.2);
			rightEye.BrickColor = new BrickColor("Institutional white");
			rightEye.Material = Enum.Material.Neon;
			rightEye.Shape = Enum.PartType.Ball;
			rightEye.CanCollide = false;
			rightEye.Parent = head;

			// Position eyes
			const leftEyeWeld = new Instance("Weld");
			leftEyeWeld.Part0 = head;
			leftEyeWeld.Part1 = leftEye;
			leftEyeWeld.C0 = new CFrame(-0.3, 0.2, 0.4);
			leftEyeWeld.Parent = leftEye;

			const rightEyeWeld = new Instance("Weld");
			rightEyeWeld.Part0 = head;
			rightEyeWeld.Part1 = rightEye;
			rightEyeWeld.C0 = new CFrame(0.3, 0.2, 0.4);
			rightEyeWeld.Parent = rightEye;

			// Add special features based on pet type
			if (config.special === "Wings") {
				const leftWing = new Instance("Part");
				leftWing.Name = "LeftWing";
				leftWing.Size = new Vector3(1, 0.1, 1.5);
				leftWing.BrickColor = new BrickColor("Institutional white");
				leftWing.Material = Enum.Material.Neon;
				leftWing.CanCollide = false;
				leftWing.Parent = pet;

				const rightWing = new Instance("Part");
				rightWing.Name = "RightWing";
				rightWing.Size = new Vector3(1, 0.1, 1.5);
				rightWing.BrickColor = new BrickColor("Institutional white");
				rightWing.Material = Enum.Material.Neon;
				rightWing.CanCollide = false;
				rightWing.Parent = pet;

				// Position wings
				const leftWingWeld = new Instance("Weld");
				leftWingWeld.Part0 = body;
				leftWingWeld.Part1 = leftWing;
				leftWingWeld.C0 = new CFrame(-0.8, 0, 0).mul(CFrame.Angles(0, math.rad(45), 0));
				leftWingWeld.Parent = leftWing;

				const rightWingWeld = new Instance("Weld");
				rightWingWeld.Part0 = body;
				rightWingWeld.Part1 = rightWing;
				rightWingWeld.C0 = new CFrame(0.8, 0, 0).mul(CFrame.Angles(0, math.rad(-45), 0));
				rightWingWeld.Parent = rightWing;
			} else if (config.special === "Horns") {
				const leftHorn = new Instance("Part");
				leftHorn.Name = "LeftHorn";
				leftHorn.Size = new Vector3(0.2, 0.5, 0.2);
				leftHorn.BrickColor = new BrickColor("Gold");
				leftHorn.Material = Enum.Material.Neon;
				leftHorn.CanCollide = false;
				leftHorn.Parent = head;

				const rightHorn = new Instance("Part");
				rightHorn.Name = "RightHorn";
				rightHorn.Size = new Vector3(0.2, 0.5, 0.2);
				rightHorn.BrickColor = new BrickColor("Gold");
				rightHorn.Material = Enum.Material.Neon;
				rightHorn.CanCollide = false;
				rightHorn.Parent = head;

				// Position horns
				const leftHornWeld = new Instance("Weld");
				leftHornWeld.Part0 = head;
				leftHornWeld.Part1 = leftHorn;
				leftHornWeld.C0 = new CFrame(-0.3, 0.5, 0);
				leftHornWeld.Parent = leftHorn;

				const rightHornWeld = new Instance("Weld");
				rightHornWeld.Part0 = head;
				rightHornWeld.Part1 = rightHorn;
				rightHornWeld.C0 = new CFrame(0.3, 0.5, 0);
				rightHornWeld.Parent = rightHorn;
			} else if (config.special === "Fire") {
				const fire = new Instance("ParticleEmitter");
				fire.Name = "Fire";
				fire.Color = new ColorSequence([
					new ColorSequenceKeypoint(0, new Color3(1, 0, 0)),
					new ColorSequenceKeypoint(0.5, new Color3(1, 0.5, 0)),
					new ColorSequenceKeypoint(1, new Color3(1, 0, 0)),
				]);
				fire.Size = new NumberSequence([new NumberSequenceKeypoint(0, 0.5), new NumberSequenceKeypoint(1, 0)]);
				fire.Rate = 50;
				fire.Speed = new NumberRange(2, 4);
				fire.Lifetime = new NumberRange(0.2, 0.4);
				fire.Parent = head;
			}

			// Make the pet follow the player using BodyPosition
			const bp = new Instance("BodyPosition");
			bp.MaxForce = new Vector3(10000, 10000, 10000);
			bp.D = 100;
			bp.P = 1000;
			bp.Position = body.Position;
			bp.Parent = body;

			// Store the pet in a table for cleanup
			if (!playerData.has(player)) {
				playerData.set(player, {});
			}
			playerData.get(player)!.pet = pet;

			// Update pet position every frame
			const connection = RunService.Heartbeat.Connect(() => {
				if (player.Character?.PrimaryPart) {
					const targetPosition = player.Character.PrimaryPart.Position.add(new Vector3(0, 2, -3));
					bp.Position = targetPosition;
				}
			});

			// Clean up when player leaves
			Players.PlayerRemoving.Connect((leavingPlayer) => {
				if (leavingPlayer === player) {
					connection.Disconnect();
					pet.Destroy();
				}
			});
		}
	}
});

// Handle player leaving
Players.PlayerRemoving.Connect((player) => {
	const data = playerData.get(player);
	if (data?.pet) {
		data.pet.Destroy();
	}
	playerData.delete(player);
});

// Handle feeding
feedEvent.OnServerEvent.Connect((player) => {
	const data = playerData.get(player);
	if (data?.pet && data.foodCount && data.foodCount > 0) {
		data.foodCount -= 1;
		print(`${player.Name} fed their pet! Food remaining: ${data.foodCount}`);

		// Make the pet grow or change color when fed
		const pet = data.pet;
		const body = pet.FindFirstChild("Body") as Part;
		if (body) {
			// Make the pet slightly bigger
			body.Size = body.Size.add(new Vector3(0.1, 0.1, 0.1));

			// Change color to a new random magical color
			body.BrickColor = getRandomMagicalColor();

			// Update head color to match
			const head = pet.FindFirstChild("Head") as Part;
			if (head) {
				head.BrickColor = body.BrickColor;
			}
		}
	}
});

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
	if (spawnPoint?.IsA("BasePart")) {
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
