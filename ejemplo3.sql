DECLARE
    v_emp employees%ROWTYPE;
BEGIN
    -- VALUES (1111,'Maria', 'Gonzalez', 'mgonz@gmail.com', 432311111
    -- ,'10/10/2000', 'AD_PRES',1243,NULL,NULL,10);
    v_emp.employee_id :=1111;
    INSERT INTO employees
    VALUES (.................);
    DBMS_OUTPUT.PUT_LINE ('INSERTADO CORRECTAMENTE');
    UPDATE employees
    SET commission_pct = commission_pct + 200
    WHERE employee_id = v_emp.employee_id;
    DBMS_OUTPUT.PUT_LINE ('MODIFICACION CORRECTA');
    DELETE FROM employees
    WHERE employee_id = v_emp.employee_id;
    DBMS_OUTPUT.PUT_LINE ('ELIMINADO CORRECTAMENTE');
END;