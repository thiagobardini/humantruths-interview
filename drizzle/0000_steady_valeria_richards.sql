CREATE TABLE "interviews" (
	"id" text PRIMARY KEY NOT NULL,
	"call_id" text NOT NULL,
	"participant_id" text,
	"transcript" json DEFAULT '[]'::json,
	"duration" integer DEFAULT 0 NOT NULL,
	"completion_status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interviews_call_id_unique" UNIQUE("call_id")
);
