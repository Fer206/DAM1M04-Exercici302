DECLARE
    total_categoria number;
    categoria_actual employees.job_id%TYPE;
BEGIN
    total_categoria := 0;
    categoria_actual:='none';
    FOR row in (select first_name,last_name,salary,job_id
                from employees
                order by job_id) LOOP
        if row.job_id != categoria_actual THEN
            -- mostrar el total de la categoria
            total_categoria := 0;
        ELSE
            total_categoria := total_categoria+row.salary;
        end if;
        DBMS_OUTPUT.PUT_LINE('Empleado: ' || row.first_name || ' ' || row.last_name);
        DBMS_OUTPUT.PUT_LINE('Categoria: ' || row.job_id);
        DBMS_OUTPUT.PUT_LINE('Total categoria: ' || total_categoria);
        categoria_actual := row.job_id;
    END LOOP;
END;