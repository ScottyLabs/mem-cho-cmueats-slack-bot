CREATE TABLE "sites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"display_name" text NOT NULL,
	"url" text NOT NULL,
	"channel_to_notify" text NOT NULL,
	"should_ping" boolean NOT NULL,
	"actively_tracked" boolean DEFAULT true NOT NULL,
	"date_added" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" integer,
	"up" boolean NOT NULL,
	"details" text,
	"response_time_ms" double precision,
	"time_checked" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "records" ADD CONSTRAINT "records_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;