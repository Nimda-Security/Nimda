INSERT INTO authority (authority_name)
SELECT 'ROLE_STUDY_LEADER'
WHERE NOT EXISTS (
    SELECT 1 FROM authority WHERE authority_name = 'ROLE_STUDY_LEADER'
);