import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills.js'
import { bills } from "../fixtures/bills.js"
import { ROUTES } from "../constants/routes"
import { fireEvent, screen } from "@testing-library/dom"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
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
    })
    test("Then bills generate error on load", () => {
      const html = BillsUI({ data: [], loading: false, error: true })
      document.body.innerHTML = html
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
      
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const iconEye = screen.getAllByTestId("icon-eye")[0]

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

      const somethingSpy = jest.spyOn(billsPage, 'modal');
      myObj.doSomething();
      expect(somethingSpy).toHaveBeenCalled();

      const handleClick = jest.fn(billsPage.handleClickIconEye(iconEye))    
      iconEye.addEventListener("click", handleClick)
      fireEvent.click(iconEye)
        expect(handleClick).toHaveBeenCalled()

        
    })
  })
})