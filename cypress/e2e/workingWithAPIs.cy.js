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

it.only('waiting for api calls',()=>{
    cy.intercept('GET','**/api/articles*').as('articleApiCall')
    cy.loginToApplication()
    //cy.get('app-article-list').should('contain.text','Bondar Academy')    
    //OR
    cy.wait('@articleApiCall').then(apiArticleObject=>{
        console.log(apiArticleObject)
        expect(apiArticleObject.response.body.articles[0].title).to.contain('Bondar Academy')
    })
    cy.get('app-article-list').invoke('text').then(allArticlesTexts=>{
        expect(allArticlesTexts).to.contain('Bondar Academy') //we look for the text "Bondar Academy"
    })

})