
function f(x,y){
    console.log(typeof(y))
    return 2*x
}

function f(x){
    console.log(arguments)
    return 2*x
}


a = 10; b = 15

//for(i=a; i<=f(b,17); i++)
  //  console.log("i="+i)

function printSquare(n) {
    let i = 0;  // Contor pentru liniile
    while (i < n) {
        let j = 0;
        let row = "";
        while (j < n) {
            row += "* ";
            j++;
        }
        console.log(row); // Afișează linia completă
        i++;
    }
}

// Exemplu de utilizare:
printSquare(5);

