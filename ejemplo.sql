DECLARE
/*var_numero employees.employee_id%TYPE;
var_nombre employees.first_name%TYPE;
var_trabajo employees.job_id%TYPE;
var_salario employees.salary%TYPE;*/
v_emp employees%rowtype;
BEGIN
SELECT * INTO v_emp
FROM employees
WHERE employee_id = 100;
DBMS_OUTPUT.PUT_LINE('Los datos del empleado son: ');
DBMS_OUTPUT.PUT_LINE('CODIGO: '||var_numero);
DBMS_OUTPUT.PUT_LINE('NOMBRE: '||var_nombre);
DBMS_OUTPUT.PUT_LINE('TRABAJO: '||var_trabajo);
DBMS_OUTPUT.PUT_LINE('SALARIO: '||var_salario);
END;
/