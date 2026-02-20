
DECLARE
    total_categoria number;
    categoria_actual employees.JOB_ID%TYPE;
BEGIN
    total_categoria := 0;
    categoria_actual:='none';
    FOR row in (select first_name,last_name,salary,job_id
                from employees
                order by job_id) LOOP
        if row.job_id != categoria_actual THEN
            if categoria_actual != 'none' THEN
                DBMS_OUTPUT.PUT_LINE('Total de ' || categoria_actual || ': ' || total_categoria);
            END IF;
                total_categoria := row.salary;
                categoria_actual := row.job_id;
            
        ELSE
            total_categoria := total_categoria+row.salary;
        end if;
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('Total de ' || categoria_actual || ': ' || total_categoria);

END;