DECLARE
inicio NUMBER := 0;
final NUMBER :=10;
resultado NUMBER :=0;
num NUMBER := 7;
BEGIN
    FOR i in inicio..final LOOP
        
        resultado := num * i;
        DBMS_OUTPUT.PUT_LINE (resultado);

    END LOOP;
END;