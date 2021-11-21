import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import users from "../constants/usersTest.js"
import firebase from "../__mocks__/firebase"

jest.mock('../app/firestore')

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then show page", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const message = await screen.getByText(/Envoyer une note de frais/)
      expect(message).toBeTruthy()
    })


    const callChangeFile = (fileUpload) => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const changeFile = screen.getByTestId("file")

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

      // we have to mock firestore to test it
      const firestore = {
        storage: {
          ref: jest.fn(() => firestore),
        },
        put: jest.fn().mockResolvedValue({ ref: { getDownloadURL: () => 'url' } }),
      }

      const newBill = new NewBill({ document, firestore: firestore, onNavigate : onNavigate, localStorage: window.localStorage })


      const file = document.querySelector(`input[data-testid="file"]`)
      file.addEventListener('change', newBill.handleChangeFile)
      fireEvent.change(file, {
        target: {
          files: fileUpload,
        },
      })

      expect(file).toBeTruthy() 
    } 

    test("Then change file in field with wrong extension", async () => {
      callChangeFile([new File(['(⌐□_□)'], 'mauvaisFichier.txt', {type: 'text/plain'})])
    })
    
    test("Then change file in field with good extension", async () => {
      callChangeFile([new File(['(⌐□_□)'], 'bonFichier.png', {type: 'image/png'})])
    })

    test("Then submit new bill", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      // localStorage should be populated with form data
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({ document, firestore: null, onNavigate : onNavigate, localStorage: window.localStorage })
      newBill.createBill = jest.fn()

      const onsubmit = document.querySelector(`form[data-testid="form-new-bill"]`)
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      onsubmit.addEventListener('click', handleSubmit)
      fireEvent.click(onsubmit)
      expect(handleSubmit).toHaveBeenCalled()

      const findText = screen.getByText('Mes notes de frais')
      expect(findText).toBeTruthy()
    })

    // POST
    describe("When I send NewBill", () => {
      test("Then fetches result from mock API", async () => {
        const addSpy = jest.spyOn(firebase, "add")
  
        const bill = {
          email : users[0]
        }
  
        const newBill = await firebase.add(bill)
        expect(addSpy).toHaveBeenCalledTimes(1)
        expect(newBill.data.length).toBe(1)
      })
  
    })
    
  })
})