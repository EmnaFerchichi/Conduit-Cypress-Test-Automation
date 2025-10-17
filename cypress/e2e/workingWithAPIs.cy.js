/// <reference types="cypress"/>
it('first test',()=>{
    //INSTEAD OF THIS:
    //cy.visit('/')
    //cy.contains('Sign in').click()
    //cy.get('[placeholder="Email"]').type('emna@gmail.com')
    //cy.get('[placeholder="Password"]').type('welcome')
    //cy.contains('button', 'Sign in').click()
    //cy.intercept('GET','**/api/tags',{fixture:'tags.json'}) //OR
    cy.intercept({method: 'GET', pathname:'tags'},{fixture:'tags.json'})
    //mocking  Articles:
    cy.intercept('GET','**/api/articles?limit=10&offset=0',{fixture:'articles.json'})   
    //WE can custom the command
    cy.loginToApplication()    

})

it('Modify API Response',()=>{
    //  '**/api/articles*' instead of  '**/api/articles?limit=10&offset=0'
    cy.intercept('GET','**/api/articles*',req=>{
        req.continue(res=>{ // req.continue :  let the request go through normally to the server, but modify the response before it reaches the browser.”
            res.body.articles[0].favoritesCount=9999999 // modify the value of the parameter "favoritesCount" of the the first article
            res.send(res.body)//sends the modified response to the browser
        })
    })
    cy.loginToApplication()    
    cy.get('app-favorite-button').first().should('contain.text','9999999') //Validation of the favoriteCount value
})

it('waiting for api calls',()=>{
    cy.intercept('GET','**/api/articles*').as('articleApiCall')
    cy.loginToApplication()
    //cy.get('app-article-list').should('contain.text','Bondar Academy')    
    //OR
    cy.wait('@articleApiCall').then(apiArticleObject=>{
        console.log(apiArticleObject)
        expect(apiArticleObject.response.body.articles[0].title).to.contain('Bondar Academy')
    })
    cy.wait(500)
    cy.get('app-article-list').invoke('text').then(allArticlesTexts=>{
        expect(allArticlesTexts).to.contain('Bondar Academy') //we look for the text "Bondar Academy"
    })

})

it('delete article',{retries:2},()=>{
    //1. Login
    cy.request({
        url:'https://conduit-api.bondaracademy.com/api/users/login',
        method:'POST',
        body:{ // the same we created in Postman : the request is called "Sign_in" under Conduit Collection
            "user":
            {
            
                "email":Cypress.env('username'),  
                "password":Cypress.env('password') 
            }
        }

    }).then(response=>{
        expect(response.status).to.equal(200) // the response of the Post request must be 200 (check postman response)
        const accessToken ='Token '+response.body.user.token // to retrive the token from the response of this Post request (check postman)
    
    //2.Create an Article:
        cy.request({
            url:'https://conduit-api.bondaracademy.com/api/articles/',
            method:'POST',
            body:
            {"article":
                {
                "title":"Test title Cypress API Testing",
                "description":"some description",
                "body":"this is a body","tagList":[]
                }
            },
            headers:{'Authorization':accessToken} //to put the token authorization in headers
        }).then(response=>{
            expect(response.status).to.equal(201) 
            expect(response.body.article.title).to.equal('Test title Cypress API Testing') // in the response of the POST article creation response 
            // it should have "test title cypress" as titel => check Postman
        })
        //Get All the Articles list and verify if the title of the 1st article in the response of the request is equal to the one we created
        cy.request({
            url: 'https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',
            method:'GET',
            headers:{'Authorization':accessToken}
        }).then(response=>{
            expect(response.status).to.equal(200)
            expect(response.body.articles[0].title).to.equal('Test title Cypress API Testing')
            const slugID= response.body.articles[0].slug //slug has 
        //Delete the article we created
            cy.request({
                url: `https://conduit-api.bondaracademy.com/api/articles/${slugID}`,
                method:'DELETE',
                headers:{'Authorization':accessToken}
            }).then(response=>{
                expect(response.status).to.equal(204)
            })
        })
        //Verification that the Article is deleted:
        cy.request({
            url:'https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',
            method:'GET',
            headers:{'Authorization':accessToken}
        }).then(response=>{
            expect(response.status).to.equal(200)
            expect(response.body.articles[0].title).to.not.equal('Test title Cypress API Testing')
        })
    })
    //3. Delete the Article we created  by clicking on delete button on UI:
    //cy.loginToApplication()
    //cy.contains('test title cypress').click()
    //cy.contains('button','Delete Article').first().click()
    //cy.get('app-article-list').should('not.contain.text','test title cypress')
})

