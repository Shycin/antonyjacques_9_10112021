import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills.js'
import { bills } from "../fixtures/bills.js"
import { ROUTES } from "../constants/routes"
import ROUTER from "../app/Router"
import { fireEvent, screen } from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH } from '../constants/routes.js'
import firestore from "../app/Firestore"
import firebase from "../__mocks__/firebase"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then generate data from API", async () => {
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
   
    test("Then bill icon in vertical layout should be highlighted", () => {

      firestore.bills = () => ({bills, get: jest.fn().mockResolvedValue()})

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const user = JSON.stringify({
        type: 'Employee'
      })
      window.localStorage.setItem('user', user)

      // définir la page dans le localstorage
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['Bills'] } })

      document.body.innerHTML = `<div id="root"></div>`

      ROUTER()

      const icon = screen.getByTestId("icon-window")
      expect(icon.classList.contains('active-icon')).toEqual(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
        const antiChrono = (a, b) => ((a < b) ? 1 : -1)
        const datesSorted = [...dates].sort(antiChrono)
        expect(dates).toEqual(datesSorted)
    })

    test("Then bills is attempt to load page", () => {
      const html = BillsUI({ data: [], loading: true })
      document.body.innerHTML = html

      const loadingElt = document.getElementById('loading')
      expect(loadingElt).not.toEqual(null)
    })
    test("Then bills generate error 404 on load", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Then bills generate error 500 on load", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })


    test("Then click on new Bills", () => {
      document.body.innerHTML = BillsUI({ data: [] })
      const btnNewBill = screen.getByTestId("btn-new-bill")

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null)
        },
        writable: true
      })

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const firebase = jest.fn()

      const bills = new Bills({
        document,
        onNavigate,
        firebase,
        localStorage: window.localStorage
      })

      const handleClick = jest.fn(bills.handleClickNewBill)    
      btnNewBill.addEventListener("click", handleClick)
      fireEvent.click(btnNewBill)
        expect(handleClick).toHaveBeenCalled()
    })

    test("Then click on icon eye to show image", () => {
      let modalIsOpen = false

      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

       // localStorage should be populated with form data
       Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null)
        },
        writable: true
      })

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const firebase = jest.fn()
      const billsPage = new Bills({
        document,
        onNavigate,
        firebase,
        localStorage: window.localStorage
      })

      window.$.fn.modal = jest.fn(()=>modalIsOpen=true)
      const handleClickIconEye = jest.fn((e) => {
        billsPage.handleClickIconEye(e.target)
      })

      const buttonsIconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
      buttonsIconEye.forEach(icon => {
        icon.addEventListener('click', handleClickIconEye)
        fireEvent.click(icon)
      })
        expect(handleClickIconEye).toHaveBeenCalled()
        expect(modalIsOpen).toEqual(true)

        
    })
  })
})