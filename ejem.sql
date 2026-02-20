DECLARE 
    total_dept number;
    dept_actual employees.department_id%TYPE;
    dept_count number;
BEGIN
    total_dept := 0;
    dept_actual := -1;
    FOR ROW in (select first_name, last_name, salary, department_id 
        from employees
        order by department_id) LOOP
        IF dept_actual != ROW.department_id THEN
            IF dept_actual != 1 THEN
                DBMS_OUTPUT.PUT_LINE('Department ' || dept_actual || ' has ' || dept_count || ' employees.');
            END IF;
            dept_actual := ROW.department_id;
            dept_count := 1;
            total_dept := total_dept + 1;
        ELSE
            dept_count := dept_count + 1;
        END IF;
    END LOOP;
