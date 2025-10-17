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
    cy.intercept('GET','**/api/articles?limit=10&offset=0',{fixture:'articles.json'})   
    cy.loginToApplication()    

})

it('Modify API Response',()=>{
    //  '**/api/articles*' instead of  '**/api/articles?limit=10&offset=0'
    cy.intercept('GET','**/api/articles*',req=>{
        req.continue(res=>{ 
            res.body.articles[0].favoritesCount=9999999
            res.send(res.body)
        })
    })
    cy.loginToApplication()    
    cy.get('app-favorite-button').first().should('contain.text','9999999') 
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
        expect(allArticlesTexts).to.contain('Bondar Academy') 
    })

})

it('delete article',{retries:2},()=>{
    //1. Login
    cy.request({
        url:'https://conduit-api.bondaracademy.com/api/users/login',
        method:'POST',
        body:{ 
            "user":
            {
            
                "email":Cypress.env('username'),  
                "password":Cypress.env('password') 
            }
        }

    }).then(response=>{
        expect(response.status).to.equal(200) 
        const accessToken ='Token '+response.body.user.token
    
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
            headers:{'Authorization':accessToken} 
        }).then(response=>{
            expect(response.status).to.equal(201) 
            expect(response.body.article.title).to.equal('Test title Cypress API Testing') 
            // it should have "test title cypress" as titel => check Postman
        })
    
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

