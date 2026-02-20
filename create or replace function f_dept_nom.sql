create or replace function f_dept_nom
(p_id departments.department_id%type)
return varchar2
is
v_ok boolean:=true;
v_name departments.department_name%type;
begin
    if p_id is null then return null; end if;

    select department_name into v_name
    from departments 
    where department_id=p_id;

    return v_name;

exception 
    when no_data_found then return 'NOT EXISTS';
    when others then return 'hi hagut un error';
end;