--
-- PostgreSQL database dump
--

-- Dumped from database version 15.7
-- Dumped by pg_dump version 15.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_Drafts_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Drafts_status" AS ENUM (
    'draft',
    'submitted',
    'approved',
    'disapproved',
    'resubmission_required',
    'checking'
);


ALTER TYPE public."enum_Drafts_status" OWNER TO postgres;

--
-- Name: enum_Logs_action; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Logs_action" AS ENUM (
    'draft_submitted',
    'approved',
    'hidden',
    'etc'
);


ALTER TYPE public."enum_Logs_action" OWNER TO postgres;

--
-- Name: enum_Notifications_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Notifications_status" AS ENUM (
    'unread',
    'read'
);


ALTER TYPE public."enum_Notifications_status" OWNER TO postgres;

--
-- Name: enum_Notifications_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Notifications_type" AS ENUM (
    'draft_submitted',
    'approved',
    'etc'
);


ALTER TYPE public."enum_Notifications_type" OWNER TO postgres;

--
-- Name: enum_Notifications_user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Notifications_user_role" AS ENUM (
    'student',
    'staff',
    'admin'
);


ALTER TYPE public."enum_Notifications_user_role" OWNER TO postgres;

--
-- Name: enum_Students_semester; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Students_semester" AS ENUM (
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '卒業'
);


ALTER TYPE public."enum_Students_semester" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Admins" (
    id integer NOT NULL,
    email character varying(255),
    password character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    date_of_birth timestamp with time zone,
    phone character varying(255),
    photo character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Admins" OWNER TO postgres;

--
-- Name: Admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Admins_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Admins_id_seq" OWNER TO postgres;

--
-- Name: Admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Admins_id_seq" OWNED BY public."Admins".id;


--
-- Name: Bookmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Bookmarks" (
    id integer NOT NULL,
    "recruiterId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Bookmarks" OWNER TO postgres;

--
-- Name: Bookmarks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Bookmarks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Bookmarks_id_seq" OWNER TO postgres;

--
-- Name: Bookmarks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Bookmarks_id_seq" OWNED BY public."Bookmarks".id;


--
-- Name: Drafts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Drafts" (
    id bigint NOT NULL,
    student_id character varying(255) NOT NULL,
    profile_data jsonb NOT NULL,
    status public."enum_Drafts_status" DEFAULT 'draft'::public."enum_Drafts_status" NOT NULL,
    submit_count integer DEFAULT 0 NOT NULL,
    comments text,
    reviewed_by bigint,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Drafts" OWNER TO postgres;

--
-- Name: Drafts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Drafts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Drafts_id_seq" OWNER TO postgres;

--
-- Name: Drafts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Drafts_id_seq" OWNED BY public."Drafts".id;


--
-- Name: Images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Images" (
    id integer NOT NULL,
    "imageUrl" character varying(2048) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Images" OWNER TO postgres;

--
-- Name: Images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Images_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Images_id_seq" OWNER TO postgres;

--
-- Name: Images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Images_id_seq" OWNED BY public."Images".id;


--
-- Name: Logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Logs" (
    id bigint NOT NULL,
    student_id character varying(255) NOT NULL,
    draft_id bigint,
    action public."enum_Logs_action" NOT NULL,
    performed_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    details jsonb
);


ALTER TABLE public."Logs" OWNER TO postgres;

--
-- Name: Logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Logs_id_seq" OWNER TO postgres;

--
-- Name: Logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Logs_id_seq" OWNED BY public."Logs".id;


--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notifications" (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    user_role public."enum_Notifications_user_role" NOT NULL,
    type public."enum_Notifications_type" NOT NULL,
    message text NOT NULL,
    status public."enum_Notifications_status" DEFAULT 'unread'::public."enum_Notifications_status" NOT NULL,
    related_id bigint,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notifications" OWNER TO postgres;

--
-- Name: Notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Notifications_id_seq" OWNER TO postgres;

--
-- Name: Notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notifications_id_seq" OWNED BY public."Notifications".id;


--
-- Name: QAs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QAs" (
    id integer NOT NULL,
    category character varying(255),
    qa_list jsonb,
    "studentId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QAs" OWNER TO postgres;

--
-- Name: QAs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."QAs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."QAs_id_seq" OWNER TO postgres;

--
-- Name: QAs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."QAs_id_seq" OWNED BY public."QAs".id;


--
-- Name: Recruiters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Recruiters" (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    company_name character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    company_description text,
    gallery jsonb DEFAULT '[]'::jsonb,
    photo character varying(255),
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    date_of_birth timestamp with time zone,
    active boolean DEFAULT false,
    kintone_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Recruiters" OWNER TO postgres;

--
-- Name: Recruiters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Recruiters_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Recruiters_id_seq" OWNER TO postgres;

--
-- Name: Recruiters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Recruiters_id_seq" OWNED BY public."Recruiters".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: Settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Settings" (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Settings" OWNER TO postgres;

--
-- Name: Settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Settings_id_seq" OWNER TO postgres;

--
-- Name: Settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Settings_id_seq" OWNED BY public."Settings".id;


--
-- Name: Staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Staff" (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    department character varying(255) NOT NULL,
    "position" character varying(255) NOT NULL,
    date_of_birth timestamp with time zone,
    phone character varying(255),
    photo character varying(255),
    active boolean DEFAULT false NOT NULL,
    kintone_id character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Staff" OWNER TO postgres;

--
-- Name: Staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Staff_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Staff_id_seq" OWNER TO postgres;

--
-- Name: Staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Staff_id_seq" OWNED BY public."Staff".id;


--
-- Name: Students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Students" (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    student_id character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    date_of_birth timestamp with time zone,
    phone character varying(255),
    photo character varying(255),
    self_introduction text,
    hobbies character varying(255),
    gallery jsonb DEFAULT '[]'::jsonb,
    skills jsonb DEFAULT '{"上級": [], "中級": [], "初級": []}'::jsonb,
    it_skills jsonb DEFAULT '{"上級": [], "中級": [], "初級": []}'::jsonb,
    other_information text,
    semester public."enum_Students_semester" DEFAULT '1'::public."enum_Students_semester",
    partner_university character varying(255),
    partner_university_credits integer DEFAULT 0 NOT NULL,
    deliverables jsonb DEFAULT '[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]'::jsonb,
    jlpt text,
    ielts text,
    jdu_japanese_certification text,
    japanese_speech_contest text,
    it_contest text,
    active boolean DEFAULT false,
    kintone_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    visibility boolean DEFAULT false NOT NULL,
    has_pending boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Students" OWNER TO postgres;

--
-- Name: Students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Students_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Students_id_seq" OWNER TO postgres;

--
-- Name: Students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Students_id_seq" OWNED BY public."Students".id;


--
-- Name: Admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admins" ALTER COLUMN id SET DEFAULT nextval('public."Admins_id_seq"'::regclass);


--
-- Name: Bookmarks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bookmarks" ALTER COLUMN id SET DEFAULT nextval('public."Bookmarks_id_seq"'::regclass);


--
-- Name: Drafts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drafts" ALTER COLUMN id SET DEFAULT nextval('public."Drafts_id_seq"'::regclass);


--
-- Name: Images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Images" ALTER COLUMN id SET DEFAULT nextval('public."Images_id_seq"'::regclass);


--
-- Name: Logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Logs" ALTER COLUMN id SET DEFAULT nextval('public."Logs_id_seq"'::regclass);


--
-- Name: Notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications" ALTER COLUMN id SET DEFAULT nextval('public."Notifications_id_seq"'::regclass);


--
-- Name: QAs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QAs" ALTER COLUMN id SET DEFAULT nextval('public."QAs_id_seq"'::regclass);


--
-- Name: Recruiters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recruiters" ALTER COLUMN id SET DEFAULT nextval('public."Recruiters_id_seq"'::regclass);


--
-- Name: Settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings" ALTER COLUMN id SET DEFAULT nextval('public."Settings_id_seq"'::regclass);


--
-- Name: Staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Staff" ALTER COLUMN id SET DEFAULT nextval('public."Staff_id_seq"'::regclass);


--
-- Name: Students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Students" ALTER COLUMN id SET DEFAULT nextval('public."Students_id_seq"'::regclass);


--
-- Data for Name: Admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Admins" (id, email, password, first_name, last_name, date_of_birth, phone, photo, "createdAt", "updatedAt") FROM stdin;
1	admin@jdu.uz	$2b$10$fXbDHNG7PLhvYXt4T0kUEO1TCM99mZ1UE6zazULvuGaNr7PCSJHG.	Admin	User	2025-03-26 12:20:51.31+05	\N		2025-03-26 12:20:51.31+05	2025-03-26 12:20:51.31+05
\.


--
-- Data for Name: Bookmarks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Bookmarks" (id, "recruiterId", "studentId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Drafts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Drafts" (id, student_id, profile_data, status, submit_count, comments, reviewed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Images" (id, "imageUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Logs" (id, student_id, draft_id, action, performed_by, created_at, details) FROM stdin;
\.


--
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notifications" (id, user_id, user_role, type, message, status, related_id, "createdAt") FROM stdin;
\.


--
-- Data for Name: QAs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QAs" (id, category, qa_list, "studentId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Recruiters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Recruiters" (id, email, password, company_name, phone, company_description, gallery, photo, first_name, last_name, date_of_birth, active, kintone_id, "createdAt", "updatedAt") FROM stdin;
1	john.doe@example.com	$2b$10$C3/QnDOZcLM6KJldcHPdyefJE0iWn1Itht61paXvB5bBZGTQ9r4Pq	Example Corp	1234567890	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/11.jpg	John	Doe	1980-01-01 06:00:00+06	t	1	2025-03-26 12:20:51.986+05	2025-03-26 12:20:51.986+05
2	jane.doe@example.com	$2b$10$eWL2PX6D65aRaSEoiUbWoedToHEuZXbxrLuPII0qJJoA8Vhx2WXYK	Example Corp	1234567891	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/72.jpg	Jane	Doe	1981-02-02 06:00:00+06	t	2	2025-03-26 12:20:52.032+05	2025-03-26 12:20:52.032+05
3	mike.smith@example.com	$2b$10$X7e6y3X3kp8OFpfyLLP.uel.utmFPo3BAMzSZnOttiG2IHgXphQ2C	Example Corp	1234567892	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/66.jpg	Mike	Smith	1982-03-03 06:00:00+06	t	3	2025-03-26 12:20:52.078+05	2025-03-26 12:20:52.078+05
4	susan.jones@example.com	$2b$10$/WTu3SW1HIxNkcyIjMSy5e.z85MKwgYSGG79HQo9AsKtPN.LEmizy	Example Corp	1234567893	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/22.jpg	Susan	Jones	1983-04-04 07:00:00+07	t	4	2025-03-26 12:20:52.124+05	2025-03-26 12:20:52.124+05
5	peter.brown@example.com	$2b$10$1i6bnT0sTbS4EztZE6GK5OdgB5OEnc1zDobfT6pJborh09c6gg8zy	Example Corp	1234567894	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/97.jpg	Peter	Brown	1984-05-05 07:00:00+07	t	5	2025-03-26 12:20:52.17+05	2025-03-26 12:20:52.17+05
6	linda.white@example.com	$2b$10$SY8fpQ2jouhXhX6W9JMXteoVIH5QbkbQRKX6KIwJkkVBGyxY23gNa	Example Corp	1234567895	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/67.jpg	Linda	White	1985-06-06 07:00:00+07	t	6	2025-03-26 12:20:52.215+05	2025-03-26 12:20:52.215+05
7	david.miller@example.com	$2b$10$lXNrBYN0Rcj4k0LQLIQveuqUf4tMiiyl4QLxqOjKW13okJ1mTlbVO	Example Corp	1234567896	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/87.jpg	David	Miller	1986-07-07 07:00:00+07	t	7	2025-03-26 12:20:52.261+05	2025-03-26 12:20:52.261+05
8	barbara.wilson@example.com	$2b$10$OMtExq3cmfRMzMgB1lbeFu5F4reqsBupTwaptYP0GYUmcnQlJMwbm	Example Corp	1234567897	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/99.jpg	Barbara	Wilson	1987-08-08 07:00:00+07	t	8	2025-03-26 12:20:52.307+05	2025-03-26 12:20:52.307+05
9	robert.moore@example.com	$2b$10$LWCjbhKL4omTjhkEtpb2eescC7B5D5Vbf5ca0CHKdGbjg3xQ8UTTG	Example Corp	1234567898	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/47.jpg	Robert	Moore	1988-09-09 07:00:00+07	t	9	2025-03-26 12:20:52.354+05	2025-03-26 12:20:52.354+05
10	patricia.taylor@example.com	$2b$10$gHlGvkS//GszlMAOv0YHZOUTIopzk0y3Gx9bjn0wXMpbfs3YywJGy	Example Corp	1234567899	A sample company description.	["https://picsum.photos/300/200?random=9", "https://picsum.photos/300/200?random=65", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=36", "https://picsum.photos/300/200?random=42"]	https://randomuser.me/api/portraits/med/men/42.jpg	Patricia	Taylor	1989-10-10 06:00:00+06	t	10	2025-03-26 12:20:52.4+05	2025-03-26 12:20:52.4+05
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20240613112152-create-admin.js
20240613112233-create-staff.js
20240613112254-create-recruiter.js
20240613112312-create-student.js
20240613112332-create-qa.js
20240613112755-create-bookmark.js
20241205021816-create-settings.js
20250202231631-create-drafts.js
20250202231934-create-logs.js
20250202232017-create-notifications.js
20250202232516-add-to-students.js
20250219191610-create-image.js
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Settings" (id, key, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Staff" (id, email, password, first_name, last_name, department, "position", date_of_birth, phone, photo, active, kintone_id, "createdAt", "updatedAt") FROM stdin;
1	staff1@example.com	$2b$10$8KV9TEebTKOHWWTOs.at6OqqJ9zlPhpKnGbbfcBC7jUI5iGBBhtbi	John	Doe	HR	Manager	1980-01-01 06:00:00+06	\N	https://randomuser.me/api/portraits/med/men/28.jpg	t	1	2025-03-26 12:20:52.453+05	2025-03-26 12:20:52.453+05
2	staff2@example.com	$2b$10$bwZapnUq0OEEYFrX3SYVleT9MU1coOVyPN4SGwALmVhO6dlCidSaC	Jane	Doe	Finance	Analyst	1981-02-02 06:00:00+06	\N	https://randomuser.me/api/portraits/med/men/50.jpg	t	2	2025-03-26 12:20:52.499+05	2025-03-26 12:20:52.499+05
3	staff3@example.com	$2b$10$Rsz2biEw2Si.bBxbjwcbKOe.D2/4/gCszAqn1bt/Bw8/Z1uJK09Qy	Mike	Smith	IT	Developer	1982-03-03 06:00:00+06	\N	https://randomuser.me/api/portraits/med/men/42.jpg	t	3	2025-03-26 12:20:52.545+05	2025-03-26 12:20:52.545+05
4	staff4@example.com	$2b$10$aRUENd1ufokRUxfYZMJQXe3NQQ5MCeQVyXwDKWUmIDscR9Bb5LSFy	Susan	Jones	Marketing	Coordinator	1983-04-04 07:00:00+07	\N	https://randomuser.me/api/portraits/med/men/39.jpg	t	4	2025-03-26 12:20:52.591+05	2025-03-26 12:20:52.591+05
5	staff5@example.com	$2b$10$V3T8HU35yo9ayCijXA9x2u1q2vBBk0cX9UnZH7qBXI64nnFdVRagq	Peter	Brown	Sales	Executive	1984-05-05 07:00:00+07	\N	https://randomuser.me/api/portraits/med/men/85.jpg	t	5	2025-03-26 12:20:52.637+05	2025-03-26 12:20:52.637+05
6	staff6@example.com	$2b$10$DDtak4paNnlzGx2ULB4eU.8kM3U.MePpO9gjWewuyfHyn43fG9kVa	Linda	White	HR	Assistant	1985-06-06 07:00:00+07	\N	https://randomuser.me/api/portraits/med/men/95.jpg	t	6	2025-03-26 12:20:52.683+05	2025-03-26 12:20:52.683+05
7	staff7@example.com	$2b$10$zOAyNel9Fl4cJMpBEyIWo.K/yE4K/nNKcDAn3Z0CzItfOcyqGVViS	David	Miller	Finance	Manager	1986-07-07 07:00:00+07	\N	https://randomuser.me/api/portraits/med/men/18.jpg	t	7	2025-03-26 12:20:52.729+05	2025-03-26 12:20:52.729+05
8	staff8@example.com	$2b$10$q6HG/CsFvLkT79rRVCuAY.0KdJptq/mIGh2rfuN7jGg3s251SXGxm	Barbara	Wilson	IT	Analyst	1987-08-08 07:00:00+07	\N	https://randomuser.me/api/portraits/med/men/63.jpg	t	8	2025-03-26 12:20:52.774+05	2025-03-26 12:20:52.774+05
9	staff9@example.com	$2b$10$wpLXxkD5NoTbRZrX6Tpkgup8jV7uvbdigLNOzmshNVl0vld8Alu4y	Robert	Moore	Marketing	Executive	1988-09-09 07:00:00+07	\N	https://randomuser.me/api/portraits/med/men/70.jpg	t	9	2025-03-26 12:20:52.819+05	2025-03-26 12:20:52.819+05
10	staff10@example.com	$2b$10$3xE1q5oXqTJVircaeLgmeOn5IsqPFjOZFL4bjOwm69oVciOCOHQ5K	Patricia	Taylor	Sales	Coordinator	1989-10-10 06:00:00+06	\N	https://randomuser.me/api/portraits/med/men/31.jpg	t	10	2025-03-26 12:20:52.861+05	2025-03-26 12:20:52.861+05
\.


--
-- Data for Name: Students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Students" (id, email, password, student_id, first_name, last_name, date_of_birth, phone, photo, self_introduction, hobbies, gallery, skills, it_skills, other_information, semester, partner_university, partner_university_credits, deliverables, jlpt, ielts, jdu_japanese_certification, japanese_speech_contest, it_contest, active, kintone_id, "createdAt", "updatedAt", visibility, has_pending) FROM stdin;
1	Delfina_Ondricka64@gmail.com	$2b$10$IXMCIltuL73LoKuHN4VuMOXoescwsRSuCj1X57Xk/Wc0vi3.m/6OC	41997638	Constance	Kuhlman	2024-06-11 08:29:54.168+05	\N	https://randomuser.me/api/portraits/med/men/59.jpg	Odit quibusdam maiores qui ea qui sit porro molestiae. Magni sit natus nihil dicta quisquam iure. Aut eius atque voluptatem rerum commodi praesentium. Labore alias quis. Alias a labore qui totam quis.	Salad	["https://picsum.photos/300/200?random=89", "https://picsum.photos/300/200?random=45", "https://picsum.photos/300/200?random=11", "https://picsum.photos/300/200?random=93", "https://picsum.photos/300/200?random=3"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Sunt et commodi eius architecto. Ut et quisquam odit et deleniti voluptatum. Aut ut id optio quia consequatur. Magnam eum itaque error alias illo ad.	7	Considine, Murphy and Rempel	115	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N2","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"6.5","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N2","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	Exclusive	Sterling	t	98323	2025-03-26 12:20:51.528+05	2025-03-26 12:20:51.528+05	f	f
2	Carlotta40@hotmail.com	$2b$10$QeR7L0za.yateX5C/FCZHun/dAb.PovnML3fCNcYxYYIutpTk0BbO	96273878	Cleo	Rowe	2024-07-01 19:16:17.411+05	\N	https://randomuser.me/api/portraits/med/men/97.jpg	Aliquid molestiae porro occaecati temporibus placeat enim et. Neque sit autem. Et sit sed sint iure quam. Culpa et odit natus.	Borders strategy Developer	["https://picsum.photos/300/200?random=45", "https://picsum.photos/300/200?random=91", "https://picsum.photos/300/200?random=99", "https://picsum.photos/300/200?random=94", "https://picsum.photos/300/200?random=47"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Velit quod qui aspernatur ipsa consequatur aut. Dolorem asperiores non. Aliquam ut et sint ad expedita dignissimos. Distinctio nemo occaecati tempora exercitationem culpa. Dolor dolores et aspernatur voluptatem enim qui laudantium ullam rem. Qui qui sed qui commodi ut.	2	Mertz - Dooley	15	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N2","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"6.5","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N2","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	program	analyzing	t	28072	2025-03-26 12:20:51.571+05	2025-03-26 12:20:51.571+05	f	f
3	Edmund89@gmail.com	$2b$10$D6hp8Y.Pb9N16p2vP/znR.55bfCZpWiMiwjsr25ntC4VmLAGro5Fe	30545978	Merle	Crist	2025-02-08 21:42:54.645+05	\N	https://randomuser.me/api/portraits/med/men/62.jpg	Nostrum enim quia animi qui. Soluta reiciendis numquam suscipit. Sed dolore aspernatur tempore eum. Quidem autem quidem quisquam velit et in delectus. Impedit non soluta aut distinctio. Eaque eius dolorem unde.	Market	["https://picsum.photos/300/200?random=61", "https://picsum.photos/300/200?random=24", "https://picsum.photos/300/200?random=37", "https://picsum.photos/300/200?random=86", "https://picsum.photos/300/200?random=60"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Possimus quasi nostrum ducimus molestias doloribus. Consectetur nulla sequi reiciendis vitae rerum sunt. Asperiores corporis qui ut perspiciatis error eaque. Quod vero omnis ut tempora tempora itaque dolores.	6	Altenwerth, Wisoky and Wilderman	70	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N4","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"8","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N4","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	hack	South	t	94335	2025-03-26 12:20:51.614+05	2025-03-26 12:20:51.614+05	f	f
4	Kaya46@gmail.com	$2b$10$6CDYCdG6ZroDy7IriPquw.M4tnlQ3P90PHOA44K1dn3CiL6rh49YK	17331004	Rod	Streich	2024-07-24 15:36:43.542+05	\N	https://randomuser.me/api/portraits/med/men/78.jpg	Aut porro recusandae voluptas quod nihil. Rem omnis veniam qui voluptatum nobis et excepturi. Rerum blanditiis sint nihil sequi suscipit illo amet nobis. Harum harum quia sint id nam quidem repellendus sed. Qui unde vel molestias earum inventore cupiditate harum.	back-end solution	["https://picsum.photos/300/200?random=47", "https://picsum.photos/300/200?random=23", "https://picsum.photos/300/200?random=30", "https://picsum.photos/300/200?random=34", "https://picsum.photos/300/200?random=55"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Dolorum et nesciunt et asperiores aspernatur error eligendi quia. Sit voluptas molestias est enim. Possimus dolores tenetur dolores quos reiciendis et et velit. Eum et ab facere porro. Aut harum et et maxime culpa eos.	6	Schultz, Kemmer and Simonis	107	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N1","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"6.5","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N1","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	program	metrics	t	76988	2025-03-26 12:20:51.658+05	2025-03-26 12:20:51.658+05	f	f
5	Garnett_Howell@gmail.com	$2b$10$Hsy5I2WhOWBMmotjhEXKxe1iikecTLVhcPl0hiNxlTvFJswRtU46.	55077552	Finn	Windler	2024-06-08 17:59:52.212+05	\N	https://randomuser.me/api/portraits/med/men/40.jpg	Eveniet velit dolores iusto mollitia optio. Asperiores esse accusamus et explicabo. Nostrum odio ab inventore itaque ut dolorem aliquid.	Credit Shoes compress	["https://picsum.photos/300/200?random=79", "https://picsum.photos/300/200?random=100", "https://picsum.photos/300/200?random=96", "https://picsum.photos/300/200?random=63", "https://picsum.photos/300/200?random=76"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Ratione voluptatem et ad aut eveniet ut. Voluptatibus iusto eum rerum. Ipsam optio quis quis aspernatur.	3	Kuvalis, Johns and Price	99	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N1","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"6.5","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N1","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	withdrawal	EXE	t	45487	2025-03-26 12:20:51.702+05	2025-03-26 12:20:51.702+05	f	f
6	Brianne34@hotmail.com	$2b$10$cYNKNIcbXosKDiTI3qRuC.6ju6XzNIpxMq5s2ibJQj/GoZq82aDum	67534663	Myrtie	Ledner	2025-03-24 06:13:38.922+05	\N	https://randomuser.me/api/portraits/med/men/49.jpg	Iure est ab. Dolorum vitae velit est laudantium. Dolorum quia eius sunt perspiciatis beatae.	generate virtual Marketing	["https://picsum.photos/300/200?random=25", "https://picsum.photos/300/200?random=80", "https://picsum.photos/300/200?random=7", "https://picsum.photos/300/200?random=38", "https://picsum.photos/300/200?random=12"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Cumque deserunt quam velit non enim inventore assumenda ipsa incidunt. Aut mollitia quo. Quae officiis ut doloremque sed est animi. Vel expedita assumenda voluptatum quis atque cumque mollitia omnis eaque.	2	Cassin - Koelpin	85	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N1","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"6.5","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N1","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	Tuna	National	t	94338	2025-03-26 12:20:51.748+05	2025-03-26 12:20:51.748+05	f	f
7	Maggie_Lakin@hotmail.com	$2b$10$XRLQLLjqPz7wbcONSjKUYOfInRfx3/FAt8F3ntLyHkl09mXKe.tZO	66761960	Itzel	Connelly	2024-07-01 11:15:36.58+05	\N	https://randomuser.me/api/portraits/med/men/43.jpg	Voluptatem dignissimos nostrum et quod optio minus est. Eveniet laudantium qui accusantium possimus a. Dolorem ducimus quia optio est ea. Laborum saepe ut et quis veritatis sint optio maiores sint. Alias illum totam et nemo distinctio ad officia voluptates numquam.	e-services Garden	["https://picsum.photos/300/200?random=13", "https://picsum.photos/300/200?random=88", "https://picsum.photos/300/200?random=12", "https://picsum.photos/300/200?random=59", "https://picsum.photos/300/200?random=12"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Labore omnis perspiciatis dignissimos totam deserunt impedit minus. Impedit repudiandae accusamus. Ad ut cumque esse corporis hic sunt id. Vero temporibus aliquid in incidunt. Libero est ipsam eum eveniet id error eius.	6	Abernathy and Sons	26	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N2","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"6","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N2","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	Ports	Concrete	t	14959	2025-03-26 12:20:51.795+05	2025-03-26 12:20:51.795+05	f	f
8	Terry.Kunze@gmail.com	$2b$10$d7ITbdAV0PoGpAtYFv5oY.LWjWVitTLjETgAqoLxEVHB8cZLEMIVa	70268411	Bernadine	Lakin	2024-08-05 07:50:56.744+05	\N	https://randomuser.me/api/portraits/med/men/64.jpg	Eos qui vel sit. Est rerum non qui aut modi. In quis ratione cum assumenda sint dolorem. Cum ipsum veritatis eveniet dolorem laboriosam sint dolorem. Ipsum consequatur ut totam illum animi fugiat dolores consequatur. Eos iure enim repellendus unde in.	Denar Seamless Borders	["https://picsum.photos/300/200?random=72", "https://picsum.photos/300/200?random=3", "https://picsum.photos/300/200?random=18", "https://picsum.photos/300/200?random=92", "https://picsum.photos/300/200?random=71"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Veniam magni fugiat itaque incidunt qui saepe ut. Quia iure consequatur numquam natus veniam unde. Voluptatem tempore voluptates quasi omnis id aut. Adipisci blanditiis corrupti doloremque explicabo est quas molestiae a. A veritatis atque voluptatibus quo iusto sequi dignissimos molestiae sapiente. Quas enim quam architecto facilis id neque.	5	Veum LLC	111	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N2","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"8","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N2","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	Singapore	Seamless	t	54631	2025-03-26 12:20:51.84+05	2025-03-26 12:20:51.84+05	f	f
9	Flo_Towne@gmail.com	$2b$10$rxw/EUw2WdSCxiFgiXiGguBmzM12I6TbqF.damiJTyjlTE87xjE9G	42966880	Kristofer	Rolfson	2024-12-01 20:03:21.793+05	\N	https://randomuser.me/api/portraits/med/men/84.jpg	Sit delectus id culpa consequatur ut. Quia ad rem laborum placeat consequatur laborum. Ut id porro eum. In tenetur veniam eum iste eius omnis unde.	support	["https://picsum.photos/300/200?random=64", "https://picsum.photos/300/200?random=81", "https://picsum.photos/300/200?random=42", "https://picsum.photos/300/200?random=67", "https://picsum.photos/300/200?random=98"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Porro blanditiis hic numquam reiciendis in error autem eveniet. Vero porro occaecati. Perferendis sapiente odit quos veritatis.	1	Bode - Considine	83	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N3","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"7","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N3","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	Michigan	Pants	t	66185	2025-03-26 12:20:51.886+05	2025-03-26 12:20:51.886+05	f	f
10	Lina_Runolfsson@yahoo.com	$2b$10$iEwZDN7TVxwN0pZ8xyeiPOV6akAAmjriMLVRHrFosaqTtGxQReboC	50120920	Leta	Kautzer	2025-01-16 05:56:40.476+05	\N	https://randomuser.me/api/portraits/med/men/11.jpg	Illo et inventore quia ducimus cum. Consequuntur impedit commodi adipisci. Et quis voluptates ullam distinctio. Voluptas doloremque sed ipsam quas ut aperiam cupiditate aliquam. Dolores aperiam quo. Velit rerum vel pariatur laborum repudiandae consequatur est nostrum.	deposit	["https://picsum.photos/300/200?random=61", "https://picsum.photos/300/200?random=91", "https://picsum.photos/300/200?random=94", "https://picsum.photos/300/200?random=42", "https://picsum.photos/300/200?random=81"]	{"上級": [{"name": "Public Speaking", "color": "#ff5722"}], "中級": [{"name": "Project Management", "color": "#673ab7"}], "初級": [{"name": "Graphic Design", "color": "#ff9800"}]}	{"上級": [{"name": "React", "color": "#039be5"}, {"name": "Vue", "color": "#2e7d32"}], "中級": [{"name": "MySQL", "color": "#00838f"}], "初級": [{"name": "Redis", "color": "#d32f2f"}]}	Aut aliquid esse et ducimus est quidem. Numquam quam vel deleniti soluta voluptas temporibus dignissimos et est. Est nobis dolor omnis rerum cupiditate sunt laborum sunt non. Dolor nobis laborum ea est.	6	Rempel - Ward	97	[{"link": "link1", "role": ["role1", "role2"], "title": "title1", "codeLink": "link1", "imageLink": "link1", "description": "description1"}, {"link": "link2", "role": ["role1", "role2"], "title": "title1", "codeLink": "link2", "imageLink": "link2", "description": "description2"}]	{"highest":"N1","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	{"highest":"6.5","ieltslist":[{"level":"6.5","date":"2022-12"},{"level":"6.0","date":"2020-12"}]}	{"highest":"N1","jlptlist":[{"level":"n5","date":"2022-12"},{"level":"n5","date":"2020-12"}]}	regional	Customer	t	28135	2025-03-26 12:20:51.932+05	2025-03-26 12:20:51.932+05	f	f
12	211171m@jdu.uz	$2b$10$7G1SCaW0vVpEXbiQKdHMNeMAa9hBRQnKQJ.c0EWPtAEPo0m0v7MFq	211171	Muhammad Nur Islom	To'xtamishhoji-zoda	\N	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	7	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	""	""	""	""	""	t	341	2025-03-26 14:44:19.908+05	2025-03-26 14:48:05.386+05	f	f
13	t19b0005j@jdu.uz	$2b$10$NX2kHY7LQb0gIF9JKW9u6e3RqDGTJsPYqoaAFiDuOHaErdSH2uXYG	T19B0005	Jonibek	Abdivaitov	1997-03-15 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	7	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	""	""	""	""	""	t	69	2025-03-26 14:44:19.91+05	2025-03-26 14:48:05.388+05	f	f
11	t19b0001a@jdu.uz	$2b$10$u0N/y4S01abqaqSI8WU1pO22/KhmTJ.KSxts9x3HvSKenV5Q/11Vq	T19B0001	Abdufattohjon	Habibullayev	1998-08-17 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	7	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	""	""	""	""	""	t	52	2025-03-26 14:44:19.902+05	2025-03-26 14:48:05.388+05	f	f
16	t19a0005m@jdu.uz	$2b$10$rrNmxnJQX.7n0Xj8uEGa0OLamsV9HsI0O4oUkpUEn0S9lPErVdY2S	T19A0005	Safiyanur	Kholmatova	2000-06-28 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	8	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	""	""	""	""	""	t	50	2025-03-26 14:44:19.948+05	2025-03-26 14:48:05.389+05	f	f
19	t19a0004k@jdu.uz	$2b$10$69Yk49L6FiSbYDcfJCiHG.0bq02DICcne8RPilJsVj6Ntrc.X6WbW	T19A0004	Komiljon	Riksiyev	1996-03-22 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	卒業	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	{"highest":"N2","list":[{"level":"N2","date":"2022-08-10"}]}	""	""	""	""	f	45	2025-03-26 14:44:19.993+05	2025-03-26 14:48:05.391+05	f	f
14	t19b0009u@jdu.uz	$2b$10$hz4m0lCg4CX6tQcrcOJoBulAxJ3oPXjMh8MK4.8zUx3.Po7XdUCwu	T19B0009	Umid	Hamdamov	2001-02-14 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	卒業	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	{"highest":"N2","list":[{"level":"N2","date":"2022-08-10"}]}	""	""	""	""	f	49	2025-03-26 14:44:19.912+05	2025-03-26 14:48:05.387+05	f	f
15	t19a0009s@jdu.uz	$2b$10$W3XqJdo.Nmkr07MxU3KEQuB.RgAVDJIJchad2fNBeJNX/R6sO3zq.	T19A0009	Sarvarbek	Fozilov	1999-11-04 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	8	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	{"highest":"N2","list":[{"level":"N2","date":"2024-09-10"}]}	""	""	""	""	t	51	2025-03-26 14:44:19.946+05	2025-03-26 14:48:05.389+05	f	f
21	t19b0007s@jdu.uz	$2b$10$vks5j1Z5iIq783MtN7eLJeqmuqn2SVXXigpK7DFUItffTYzlrSwhW	T19B0007	Saydiaxror	Botirov	2001-06-21 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	卒業	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	{"highest":"N1","list":[{"level":"N1","date":"2023-08-07"}]}	""	""	""	""	f	48	2025-03-26 14:44:20.005+05	2025-03-26 14:48:05.39+05	f	f
18	t19b0006m@jdu.uz	$2b$10$pIRbADBxCci5ChKCpgoX7eR4vulSgYmgPsEao1jzUl2r3haC6Oruq	T19B0006	Mardonbek	Tursunaliyev	2000-01-06 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	卒業	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	{"highest":"N2","list":[{"level":"N2","date":"2024-09-20"}]}	""	""	""	""	f	47	2025-03-26 14:44:19.961+05	2025-03-26 14:48:05.39+05	f	f
17	t19b0004i@jdu.uz	$2b$10$RDUjXrcV2Dq4SgutUA0kpeRNvC5H0fNet9jlNHHYrGGAWisbPDmLS	T19B0004	Islombek	Kamolov	1999-04-22 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	卒業	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	{"highest":"N2","list":[{"level":"N2","date":"2024-01-11"}]}	""	""	""	""	f	46	2025-03-26 14:44:19.959+05	2025-03-26 14:48:05.391+05	f	f
20	t19a0003b@jdu.uz	$2b$10$uQEQXWeS0DBRAlMsww/Ycu.H7V42vvYiMTQWxGecUgnzKeguA3p0q	T19A0003	Botirjon	G`anijonov	2000-07-09 05:00:00+05	\N	\N	\N	\N	[]	{"上級": [], "中級": [], "初級": []}	{"上級": [], "中級": [], "初級": []}	\N	9	東京通信大学	0	[{"link": "", "role": [], "title": "", "codeLink": "", "imageLink": "", "description": ""}]	{"highest":"N2","list":[{"level":"N2","date":"2023-08-07"}]}	{"highest":"7","list":[{"level":"7","date":"2025-03-04"}]}	""	""	""	t	44	2025-03-26 14:44:19.994+05	2025-03-26 14:48:05.392+05	f	f
\.


--
-- Name: Admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Admins_id_seq"', 1, true);


--
-- Name: Bookmarks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Bookmarks_id_seq"', 1, false);


--
-- Name: Drafts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Drafts_id_seq"', 1, false);


--
-- Name: Images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Images_id_seq"', 3, true);


--
-- Name: Logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Logs_id_seq"', 1, false);


--
-- Name: Notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notifications_id_seq"', 1, false);


--
-- Name: QAs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."QAs_id_seq"', 1, false);


--
-- Name: Recruiters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Recruiters_id_seq"', 10, true);


--
-- Name: Settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Settings_id_seq"', 1, false);


--
-- Name: Staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Staff_id_seq"', 10, true);


--
-- Name: Students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Students_id_seq"', 120, true);


--
-- Name: Admins Admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_pkey" PRIMARY KEY (id);


--
-- Name: Bookmarks Bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bookmarks"
    ADD CONSTRAINT "Bookmarks_pkey" PRIMARY KEY (id);


--
-- Name: Drafts Drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drafts"
    ADD CONSTRAINT "Drafts_pkey" PRIMARY KEY (id);


--
-- Name: Drafts Drafts_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drafts"
    ADD CONSTRAINT "Drafts_student_id_key" UNIQUE (student_id);


--
-- Name: Images Images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Images"
    ADD CONSTRAINT "Images_pkey" PRIMARY KEY (id);


--
-- Name: Logs Logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Logs"
    ADD CONSTRAINT "Logs_pkey" PRIMARY KEY (id);


--
-- Name: Notifications Notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY (id);


--
-- Name: QAs QAs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QAs"
    ADD CONSTRAINT "QAs_pkey" PRIMARY KEY (id);


--
-- Name: Recruiters Recruiters_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recruiters"
    ADD CONSTRAINT "Recruiters_email_key" UNIQUE (email);


--
-- Name: Recruiters Recruiters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recruiters"
    ADD CONSTRAINT "Recruiters_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: Settings Settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_key_key" UNIQUE (key);


--
-- Name: Settings Settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_pkey" PRIMARY KEY (id);


--
-- Name: Staff Staff_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_email_key" UNIQUE (email);


--
-- Name: Staff Staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_pkey" PRIMARY KEY (id);


--
-- Name: Students Students_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Students"
    ADD CONSTRAINT "Students_email_key" UNIQUE (email);


--
-- Name: Students Students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Students"
    ADD CONSTRAINT "Students_pkey" PRIMARY KEY (id);


--
-- Name: Students Students_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Students"
    ADD CONSTRAINT "Students_student_id_key" UNIQUE (student_id);


--
-- Name: Bookmarks Bookmarks_recruiterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bookmarks"
    ADD CONSTRAINT "Bookmarks_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES public."Recruiters"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Bookmarks Bookmarks_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bookmarks"
    ADD CONSTRAINT "Bookmarks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Students"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Drafts Drafts_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drafts"
    ADD CONSTRAINT "Drafts_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public."Staff"(id);


--
-- Name: Drafts Drafts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Drafts"
    ADD CONSTRAINT "Drafts_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Students"(student_id);


--
-- Name: Logs Logs_draft_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Logs"
    ADD CONSTRAINT "Logs_draft_id_fkey" FOREIGN KEY (draft_id) REFERENCES public."Drafts"(id);


--
-- Name: Logs Logs_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Logs"
    ADD CONSTRAINT "Logs_performed_by_fkey" FOREIGN KEY (performed_by) REFERENCES public."Staff"(id);


--
-- Name: Logs Logs_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Logs"
    ADD CONSTRAINT "Logs_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Students"(student_id);


--
-- Name: QAs QAs_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QAs"
    ADD CONSTRAINT "QAs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Students"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

