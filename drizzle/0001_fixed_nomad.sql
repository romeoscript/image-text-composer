ALTER TABLE "project" DROP CONSTRAINT "project_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "userId" DROP NOT NULL;