%Nume: Oancea
%Prenume: Iustin-Alexandru
%Grupa: 363

% Subiectul I are subpunctele 
% 	a (2p)		
% 	b (2p) 
% 	c (3p) 
% 	d (3p)
% Subiectul al II-lea are subpunctele 
% 	a (2p) 
% 	b (5p) 
% 	c (3p)
% Subiectul al III-lea are subpunctele 
% 	a (3p) 
% 	b (7p)

%Subiectul 1:

fields(1, 'Mathematics').
fields(2, 'Computer Science').
fields(3, 'Philosophy').
fields(4, 'Physics').
fields(5, 'Linguistics').

authors(1, 'Donald Knuth', 'Stanford University').
authors(2, 'Bertrand Russell', 'University of Cambridge').
authors(3, 'Noam Chomsky', 'MIT').
authors(4, 'Roger Penrose', 'University of Oxford').
authors(5, 'Terence Tao', 'University of California, Los Angeles').

publishers(1, 'Springer', 'Germany').
publishers(2, 'MIT Press', 'USA').
publishers(3, 'Cambridge University Press', 'UK').
publishers(4, 'Oxford University Press', 'UK').
publishers(5, 'Addison-Wesley', 'USA').

books(101, 'The Art of Computer Programming', 1, 5, 2).
books(102, 'Principia Mathematica', 2, 3, 1).
books(103, 'Syntactic Structures', 3, 2, 5).
books(104, 'The Road to Reality', 4, 4, 4).
books(105, 'Analysis I', 5, 1, 1).
books(106, 'Modern Quantum Mechanics', 4, 1, 4).
books(107, 'Formal Semantics and Logic', 3, 3, 5).
books(108, 'Linear Algebra Done Right', 5, 5, 1).

editions(201, 101, 1, 1968).
editions(202, 101, 2, 1973).
editions(203, 102, 1, 1910).
editions(204, 102, 2, 1927).
editions(205, 103, 1, 1957).
editions(206, 104, 1, 2004).
editions(207, 105, 1, 2006).
editions(208, 106, 1, 1995).
editions(209, 107, 1, 1971).
editions(210, 108, 3, 2017).

%a)

wrote_by(Author, BooksList) :-
    authors(_, Author, _),
    findall(Title, (books(_, Title, AuthorID, _, _), authors(AuthorID, Author, _)), BooksList).

%b)

publishedMathPhilosophy(PublishersList) :-
    findall(PublisherName, 
            (books(_, _, _, PublisherID, FieldID), 
             (FieldID = 1; FieldID = 3), 
             publishers(PublisherID, PublisherName, _)), 
            PublishersList).
%c)
editionAfterYear(Year, Result) :-
    findall((Title, AuthorName),
        (editions(_, BookId, _, Y), Y >= Year,
         books(BookId, Title, AuthorId, _, _),
         authors(AuthorId, AuthorName, _)), Pairs),
    sort(Pairs, Result).

%d)
count([], 0) :- !.
count([_ | T], Res) :-
    count(T, ResT),
    Res is ResT + 1.

countByCountries(Result) :-
    findall(Country,
        (books(_, _, _, PublisherId, _),
         publishers(PublisherId, _, Country)), Countries),
    sort(Countries, UniqueCountries),
    findall((Country, Count),
        (member(Country, UniqueCountries),
         findall(1,
            (books(_, _, _, PubId, _),
             publishers(PubId, _, Country)), L),
         count(L, Count)), Result).

%Subiectul 2:

%a)
splitListEvenOdd([], [], []).
splitListEvenOdd([H|T], Even, [H|Odd]) :-
    H mod 2 =:= 1,
    splitListEvenOdd(T, Even, Odd).

splitListEvenOdd([H|T], [H|Even], Odd) :-
    H mod 2 =:= 0,
    splitListEvenOdd(T, Even, Odd).

%b)



findsum([], 0) :- !.
findSum([H|T], Sum, [H|Result], S) :-
    findsum(T, ResT),
    S <= Sum,
    S is ResT + H.

findSum([H|T], Sum, [H|Result], S) :-
    findsum(T, ResT),
    S > Sum,
    S is ResT + H.



findSublist([], _, []).
findSublist([H|T], Sum, [Res|Result]):-
    findSum([H|T], Sum, [Res|Result], S)
