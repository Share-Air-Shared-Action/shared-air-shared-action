--airterrier

SELECT * FROM airterrier WHERE upper(SUBSTRING(session_title, 1, 2)) = $1 AND season = $2 AND flag is null;


--aeroqualno2

SELECT * FROM aeroqualno2 WHERE community = $1 AND season = $2 AND flag is null;


--aeroqualo3

SELECT * FROM aeroqualo3 WHERE community = $1 AND season = $2 AND flag is null;


--metone

SELECT * FROM metone WHERE community = $1 AND season = $2 AND flag is null;


--purpleairprimary

SELECT * FROM purpleairprimary WHERE community = $1 AND season = $2 AND flag is null;


--stationarylocations

SELECT * FROM stationarylocations WHERE community = $1 AND season = $2;


-- TODO:
-- Set season on stationarylocations
-- Set error to 1 if type is PM and value is > 1000
