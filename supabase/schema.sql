create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tier text not null default 'tier_2' check (tier in ('tier_1','tier_2')),
  why text,
  status_note text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_id uuid references companies(id) on delete set null,
  role_title text,
  email text,
  status text not null default 'active' check (status in ('active','dormant','closed')),
  background text,
  referred_by uuid references contacts(id) on delete set null,
  notes text,
  last_touch_date date,
  follow_up_due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_contacts_company on contacts(company_id);
create index idx_contacts_reactivation on contacts(status, last_touch_date);

create table applications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  role_title text not null,
  posting_url text,
  track text check (track in ('internship','full_time')),
  stage text not null default 'queued' check (stage in (
    'queued','response_drafted','pending_review','escalated','assessment_pending',
    'applied','messaged','responded','interviewing','closed','failed'
  )),
  outcome text check (outcome in ('offer','rejection','withdrawn')),
  source text not null default 'web_ui' check (source in ('web_ui','agent','manual')),
  confirmation_number text,
  escalation_note text,
  assessment_deadline timestamptz,
  notes text,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_applications_stage on applications(stage);
create index idx_applications_company on applications(company_id);

create table interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  channel text not null default 'email' check (channel in ('email','call','meeting','other')),
  direction text not null default 'outbound' check (direction in ('outbound','inbound')),
  status text not null default 'drafted' check (status in (
    'drafted','sent_clean','sent_edited','replied','bounced','killed','killed_inferred'
  )),
  scenario text,
  subject text,
  body text,
  diff_notes text,
  intended_send_date date,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_interactions_contact on interactions(contact_id, created_at desc);
create index idx_interactions_status_senddate on interactions(status, intended_send_date);

create view reactivation_queue as
select
  c.id, c.name, c.company_id, c.role_title, c.status, c.last_touch_date, c.notes,
  case when c.last_touch_date is null then null else (current_date - c.last_touch_date) end as days_quiet
from contacts c
where c.status in ('active','dormant')
  and (c.last_touch_date is null or c.last_touch_date <= current_date - interval '90 days')
order by c.last_touch_date asc nulls first;
