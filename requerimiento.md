EXPLICACION NECESIDAD:


Contexto: Yo practico Crossfit

Necesidad : Quiero crear una aplicacion web que me permita almacenar y ver los registros de mis levantamientos de ciertos ejercicios tipicos como 'Clean, Snatch, Deadlift, etc'


Esta aplicacion de momento es para mi solamente y quiero tenerla disponible para usarla de mi celular.

Quisiera una primera version MVP simple con las funcionalidades minimas que describiré.

Funcionalidades:

*Registrar peso máximo: Esta parte tiene dos formas distintas que te explico:
    1.- 1 repeticion con el máximo de peso , esto es el RM o PR en otras aplicaciones,
    2.- mas de una repeticion, para esto existen varias formular para proyectar el peso a 1 repeticion, la mas conocida es la formula de Epley: 
    
        Fórmula de Epley: 1RM = (Peso levantado * 0.0333 * Repeticiones) + Peso levantado.

        Ejemplo con la fórmula de Epley:
            Si levantas 100 kg en una sentadilla por 5 repeticiones, tu 1RM estimado sería:
            1RM = (100 kg * 0.0333 * 5) + 100 kg = 116.65 kg. 


            * Debería poder identificarse si el RM que muestra fue 1 repeticion o se calculó con la formula.
    
* Para ingresar los pesos, se deben considerar la unidad de medida en libras:
    - Una Barra Olimpica siempre pesa 45 libras
    - Hay que considerar que los discos deben ser los totales de ambos lados, quizás en el futuro se puede decidir que ingresa, si solo un lado o ambos,por ahora trabajemos con ambos en total.
    -Quizás se puede agregar un selector que permita ingresar el total de discos en Kilogramos y hacer la conversion para almacenar todo en libras.
    

* Visualizar:
    - Para visualizar los pesos ya registrados, debería poder filtrar por tipo de ejercicio.
    - Se debería poder ordenar por fecha de ingreso y tambien por el peso maximo.
    - El peso se debe poder ver por libras y tambien transformado a Kilo Gramos.
    - Debería poder tener un indicador de si fue calculado con formula o fue un ingreso de 1 repeticion desde el origen.


* Conversiones de peso:

    - Por ahora, crear una pagina en blanco con un mockup, donde irá en el futuro una tabla de conversión de pesos, Por ejemplo:
        Será una tabla que partirá con el peso de una barra (45 libras) mas un disco de 10 libras a cada lado, con esto se sabrá cuanto es en kilos.
        Luego otro registro con una barra y dos discos de 15 libras.... etc.

* Porcentajes de RM:

    - Esta pagina tambien irá en borrador al comienzo y servirá para poder saber por ejemplo:
       *Cuanto es el 70 % de mi RM de Snatch, el 50% etc.
    - Tambien me permitirá ingresar un peso y calcular cuantos discos debo poner a cada ladao, según el porcentaje. etc.
    - Por ahora solo usar un mockup, la desarrollaremos mas adelante.


* Quiero que la apliaccion tenga login y BBDD. Lo que mas conozco es Supabase.

FRONT:
    Para el front, como es una version inicial, quiero que sea sobria, responsiva. Que utilizaré principalmente de mi celular.

BAckend:
    No se cual es la mejor opcion, espero me recomiendes.




Aspcectos Tecnicos:

Login y BBDD me gustaría que utilizaramos SUPABASE con MCP (Tienes otra recomendacion):

{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=<project-ref>"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<personal-access-token>"
      }
    }
  }
}