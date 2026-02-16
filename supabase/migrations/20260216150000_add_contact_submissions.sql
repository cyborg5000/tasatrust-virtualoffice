-- Contact Form Submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64),
  company VARCHAR(255),
  inquiry_type VARCHAR(80) NOT NULL,
  message TEXT NOT NULL,
  request_ip VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_submissions_created_at ON contact_submissions (created_at DESC);
CREATE INDEX idx_contact_submissions_request_ip ON contact_submissions (request_ip, created_at);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
