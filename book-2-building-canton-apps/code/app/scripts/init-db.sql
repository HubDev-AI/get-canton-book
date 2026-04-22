-- One database per Canton node
CREATE DATABASE sequencer1;
CREATE DATABASE mediator1;
CREATE DATABASE participant_supplier;
CREATE DATABASE participant_buyer;
CREATE DATABASE participant_factor;

-- Grant access
GRANT ALL PRIVILEGES ON DATABASE sequencer1 TO canton;
GRANT ALL PRIVILEGES ON DATABASE mediator1 TO canton;
GRANT ALL PRIVILEGES ON DATABASE participant_supplier TO canton;
GRANT ALL PRIVILEGES ON DATABASE participant_buyer TO canton;
GRANT ALL PRIVILEGES ON DATABASE participant_factor TO canton;
