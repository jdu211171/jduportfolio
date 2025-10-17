"use strict"

/**
 * Catch-up migration to align production DB with current models.
 * Adds missing columns using IF NOT EXISTS to be idempotent and non-destructive.
 */

module.exports = {
  async up(queryInterface) {
    const sql = `
-- Admins/Staff/Recruiters furigana safety
ALTER TABLE "public"."Admins" ADD COLUMN IF NOT EXISTS "first_name_furigana" VARCHAR;
ALTER TABLE "public"."Admins" ADD COLUMN IF NOT EXISTS "last_name_furigana" VARCHAR;
ALTER TABLE "public"."Staff" ADD COLUMN IF NOT EXISTS "first_name_furigana" VARCHAR;
ALTER TABLE "public"."Staff" ADD COLUMN IF NOT EXISTS "last_name_furigana" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "first_name_furigana" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "last_name_furigana" VARCHAR;

-- Recruiters catch-up columns
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "isPartner" BOOLEAN DEFAULT false;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "tagline" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "company_website" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "company_capital" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "company_revenue" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "company_representative" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "job_title" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "job_description" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "number_of_openings" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "employment_type" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "probation_period" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "employment_period" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "recommended_skills" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "recommended_licenses" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "recommended_other" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "salary_increase" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "bonus" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "allowances" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "holidays_vacation" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "other_notes" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "interview_method" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "japanese_level" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "application_requirements_other" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "retirement_benefit" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "telework_availability" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "housing_availability" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "relocation_support" TEXT;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "airport_pickup" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "intro_page_thumbnail" VARCHAR;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "intro_page_links" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "public"."Recruiters" ADD COLUMN IF NOT EXISTS "company_video_url" JSONB DEFAULT '[]'::jsonb;

-- Students catch-up columns
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "faculty" VARCHAR;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "department" VARCHAR;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "gender" VARCHAR;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "parents_phone_number" VARCHAR;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "enrollment_date" DATE;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "partner_university_enrollment_date" DATE;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "language_skills" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "gallery" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "skills" JSONB;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "it_skills" JSONB;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "other_skills" JSONB;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "deliverables" JSONB;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "partner_university_credits" INTEGER DEFAULT 0;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "world_language_university_credits" INTEGER DEFAULT 0;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "business_skills_credits" INTEGER DEFAULT 0;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "japanese_employment_credits" INTEGER DEFAULT 0;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "liberal_arts_education_credits" INTEGER DEFAULT 0;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "specialized_education_credits" INTEGER DEFAULT 0;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "total_credits" INTEGER DEFAULT 0;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "self_introduction" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "hobbies" VARCHAR;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "jlpt" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "ielts" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "jdu_japanese_certification" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "japanese_speech_contest" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "it_contest" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "graduation_year" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "graduation_season" TEXT;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "credit_details" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "visibility" BOOLEAN DEFAULT false;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "has_pending" BOOLEAN DEFAULT false;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "first_name_furigana" VARCHAR;
ALTER TABLE "public"."Students" ADD COLUMN IF NOT EXISTS "last_name_furigana" VARCHAR;
`
    return queryInterface.sequelize.query(sql)
  },

  async down() {
    // Non-destructive: no-op. If needed, implement explicit DROP COLUMNs.
    return Promise.resolve()
  },
}

