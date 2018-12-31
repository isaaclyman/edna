describe('the landing page', () => {
  before(() => {
    cy.clearCookie('connect.sid')
  })

  beforeEach(() => {
    cy.visit('/')
  })

  it('exists', () => {
    cy.get('body')
  })
})
