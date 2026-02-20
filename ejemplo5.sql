DECLARE
    v_emp employees%ROWTYPE;
BEGIN
    -- VALUES (1111,'Maria', 'Gonzalez', 'mgonz@gmail.com', 432311111
    -- ,'10/10/2000', 'AD_PRES',1243,NULL,NULL,10);
    v_emp.employee_id :=2222;
    v_emp.first_name  :='Maria';
    v_emp.last_name   :='Gonzalez';
    v_emp.email       :='mgonzal@gmail.com';
    v_emp.phone_number :=432311111;
    v_emp.hire_date   :='10/10/2000';
    v_emp.job_id      :='AD_PRES';
    v_emp.salary      :=5000;
    v_emp.department_id:= 10;
    /*INSERT INTO employees
            (employee_id,first_name,last_name ,
            email,phone_number,hire_date,job_id,
            salary,department_id)        
    VALUES (v_emp.employee_id,v_emp.first_name,v_emp.last_name ,
            v_emp.email,v_emp.phone_number,v_emp.hire_date,v_emp.job_id,
            v_emp.salary,v_emp.department_id);
    DBMS_OUTPUT.PUT_LINE ('INSERTADO CORRECTAMENTE');*/
    UPDATE employees
    SET commission_pct = nvl(commission_pct,0) + 0.33
    WHERE employee_id = v_emp.employee_id;
    DBMS_OUTPUT.PUT_LINE ('MODIFICACION CORRECTA');
    DELETE FROM employees
    WHERE employee_id = v_emp.employee_id;
    DBMS_OUTPUT.PUT_LINE ('ELIMINADO CORRECTAMENTE');
    commit;
END;