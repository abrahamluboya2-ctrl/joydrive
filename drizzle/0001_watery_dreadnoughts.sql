CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`licenseNumber` varchar(50) NOT NULL,
	`licenseExpiry` timestamp NOT NULL,
	`bankAccount` varchar(100) NOT NULL,
	`isVerified` int NOT NULL DEFAULT 0,
	`status` enum('offline','online','on_ride','break') NOT NULL DEFAULT 'offline',
	`currentLocation` json,
	`totalRides` int DEFAULT 0,
	`totalEarnings` decimal(12,2) DEFAULT '0',
	`rating` decimal(3,2) DEFAULT '0',
	`ratingCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('profile_photo','document','vehicle_photo') NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`mimeType` varchar(50),
	`size` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`rideId` int,
	`isRead` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`passengerId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`method` enum('card','cash') NOT NULL DEFAULT 'card',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`stripePaymentId` varchar(100),
	`stripeIntentId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`rideId` int NOT NULL,
	`score` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rideHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`passengerId` int NOT NULL,
	`driverId` int NOT NULL,
	`from` varchar(255) NOT NULL,
	`to` varchar(255) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`rideType` enum('Lite','Drive','VIP') NOT NULL,
	`distance` decimal(8,2),
	`duration` int,
	`completedAt` timestamp NOT NULL,
	CONSTRAINT `rideHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passengerId` int NOT NULL,
	`driverId` int,
	`vehicleId` int,
	`vehicleType` enum('Lite','Drive','VIP') NOT NULL,
	`pickupLocation` json NOT NULL,
	`dropoffLocation` json NOT NULL,
	`stops` json,
	`estimatedDistance` decimal(8,2),
	`estimatedDuration` int,
	`baseFare` decimal(8,2) NOT NULL,
	`distanceFare` decimal(8,2) DEFAULT '0',
	`timeFare` decimal(8,2) DEFAULT '0',
	`totalFare` decimal(8,2) NOT NULL,
	`status` enum('requested','accepted','driver_arriving','in_progress','completed','cancelled') NOT NULL DEFAULT 'requested',
	`paymentMethod` enum('card','cash') NOT NULL DEFAULT 'card',
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`cancelledAt` timestamp,
	`cancellationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`type` enum('Lite','Drive','VIP') NOT NULL,
	`licensePlate` varchar(20) NOT NULL,
	`color` varchar(50),
	`capacity` int DEFAULT 4,
	`make` varchar(100),
	`model` varchar(100),
	`year` int,
	`photoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voiceMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`audioUrl` text NOT NULL,
	`transcription` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voiceMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','driver') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `photoUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `rating` decimal(3,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `users` ADD `ratingCount` int DEFAULT 0;--> statement-breakpoint
CREATE INDEX `driver_userId_idx` ON `drivers` (`userId`);--> statement-breakpoint
CREATE INDEX `file_userId_idx` ON `files` (`userId`);--> statement-breakpoint
CREATE INDEX `notification_userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `payment_rideId_idx` ON `payments` (`rideId`);--> statement-breakpoint
CREATE INDEX `payment_passengerId_idx` ON `payments` (`passengerId`);--> statement-breakpoint
CREATE INDEX `rating_fromUserId_idx` ON `ratings` (`fromUserId`);--> statement-breakpoint
CREATE INDEX `rating_toUserId_idx` ON `ratings` (`toUserId`);--> statement-breakpoint
CREATE INDEX `rating_rideId_idx` ON `ratings` (`rideId`);--> statement-breakpoint
CREATE INDEX `rideHistory_passengerId_idx` ON `rideHistory` (`passengerId`);--> statement-breakpoint
CREATE INDEX `rideHistory_driverId_idx` ON `rideHistory` (`driverId`);--> statement-breakpoint
CREATE INDEX `ride_passengerId_idx` ON `rides` (`passengerId`);--> statement-breakpoint
CREATE INDEX `ride_driverId_idx` ON `rides` (`driverId`);--> statement-breakpoint
CREATE INDEX `ride_status_idx` ON `rides` (`status`);--> statement-breakpoint
CREATE INDEX `ride_vehicleType_idx` ON `rides` (`vehicleType`);--> statement-breakpoint
CREATE INDEX `vehicle_driverId_idx` ON `vehicles` (`driverId`);--> statement-breakpoint
CREATE INDEX `voiceMessage_rideId_idx` ON `voiceMessages` (`rideId`);