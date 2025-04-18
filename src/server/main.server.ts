import { Players, Workspace, ReplicatedStorage, RunService } from "@rbxts/services";
import { getRandomMagicalColor } from "../shared/colors";

// On crée un RemoteEvent à la racine
const feedEvent = new Instance("RemoteEvent");
feedEvent.Name = "FeedPet";
feedEvent.Parent = ReplicatedStorage;

feedEvent.OnServerEvent.Connect((player) => {
	print(`${player.Name} a nourri son pet 🥰`);
});

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((character) => {
		const hrp = character.WaitForChild("HumanoidRootPart") as Part;

		// Créer un modèle de BabyDragon en clonant un modèle existant dans ReplicatedStorage
		const babyDragon = ReplicatedStorage.WaitForChild("BabyDragon").Clone() as Model;
		babyDragon.Parent = Workspace;

		// Set PrimaryPart if not already set
		if (!babyDragon.PrimaryPart) {
			babyDragon.PrimaryPart = babyDragon.FindFirstChild("Body") as BasePart;
		}

		// Positionner le BabyDragon près du joueur
		babyDragon.SetPrimaryPartCFrame(hrp.CFrame.add(new Vector3(3, 3, 0)));

		// Ajout d'une logique pour le faire suivre le joueur
		const bp = new Instance("BodyPosition");
		bp.MaxForce = new Vector3(10000, 10000, 10000);
		bp.D = 100;
		bp.P = 1000;
		bp.Position = babyDragon.PrimaryPart.Position;
		bp.Parent = babyDragon.PrimaryPart;

		task.spawn(() => {
			while (character.Parent !== undefined && babyDragon.Parent !== undefined) {
				bp.Position = hrp.Position.add(new Vector3(3, 3, 0)); // Suivre le joueur
				task.wait(0.05);
			}
		});

		print(`${player.Name} a obtenu un Baby Dragon !`);
	});

	// Create a basic pet (we'll make it more magical later)
	const pet = new Instance("Part");
	pet.Name = "Pet";
	pet.Size = new Vector3(1, 1, 1);
	pet.BrickColor = new BrickColor("Really red"); // Starting with a red cube as mentioned in concept
	pet.Anchored = false;
	pet.Parent = player.Character;

	// Make the pet follow the player
	RunService.Heartbeat.Connect(() => {
		if (player.Character?.PrimaryPart) {
			const targetPosition = player.Character.PrimaryPart.Position.add(
				new Vector3(0, 2, -3), // Position behind and above the player
			);
			pet.Position = pet.Position.Lerp(targetPosition, 0.1);
		}
	});
});

Players.PlayerRemoving.Connect((player) => {
	// Clean up the pet when player leaves
	if (player.Character) {
		const pet = player.Character.FindFirstChild("Pet");
		if (pet) {
			pet.Destroy();
		}
	}
});

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((character) => {
		const hrp = character.WaitForChild("HumanoidRootPart") as Part;

		// Crée un modèle pour le pet
		const petModel = new Instance("Model");
		petModel.Name = "Pet";

		// Partie du corps
		const body = new Instance("Part");
		body.Name = "Body";
		body.Size = new Vector3(2, 2, 2);
		body.Position = hrp.Position.add(new Vector3(3, 3, 0));
		body.Anchored = false;
		body.BrickColor = new BrickColor("Bright red");
		body.CanCollide = false;
		body.Parent = petModel;

		// Partie de la tête
		const head = new Instance("Part");
		head.Name = "Head";
		head.Size = new Vector3(1.5, 1.5, 1.5);
		head.Position = body.Position.add(new Vector3(0, 2, 0));
		head.Anchored = false;
		head.BrickColor = new BrickColor("Bright blue");
		head.CanCollide = false;
		head.Parent = petModel;

		// Ajout d'un BodyPosition pour faire suivre le pet
		const bp = new Instance("BodyPosition");
		bp.MaxForce = new Vector3(10000, 10000, 10000);
		bp.D = 100;
		bp.P = 1000;
		bp.Position = body.Position;
		bp.Parent = body;

		petModel.PrimaryPart = body;
		petModel.Parent = Workspace;

		// Suivre le joueur
		task.spawn(() => {
			while (character.Parent !== undefined && petModel.Parent !== undefined) {
				bp.Position = hrp.Position.add(new Vector3(3, 3, 0));
				task.wait(0.05);
			}
		});

		// Variable de faim
		let hunger = 100; // Le pet commence avec 100% de faim

		// Réduire la faim au fil du temps (ex : 1% par 10 secondes)
		task.spawn(() => {
			while (petModel.Parent !== undefined) {
				task.wait(10);
				hunger = math.max(0, hunger - 1); // La faim ne peut pas devenir négative
				print(`Faim du pet : ${hunger}%`);
			}
		});

		// Nourrir le pet
		const feedEvent = ReplicatedStorage.WaitForChild("FeedPet") as RemoteEvent;
		feedEvent.OnServerEvent.Connect(() => {
			if (hunger < 100) {
				hunger = math.min(100, hunger + 10); // Nourrir augmente la faim de 10%
				print(`Le pet a été nourri, faim : ${hunger}%`);
			}
			// Evolution du pet après avoir atteint une faim de 100%
			else if (hunger === 100) {
				body.Size = new Vector3(4, 4, 4); // Le corps devient plus grand
				head.Size = new Vector3(2, 2, 2); // La tête devient plus grande
				body.BrickColor = new BrickColor("Bright green"); // Le pet devient vert
				head.BrickColor = new BrickColor("Bright yellow");
				print("Le pet a évolué !");
			}
		});
	});
});

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
const playerData = new Map<Player, { pet?: Model }>();

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
