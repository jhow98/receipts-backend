jest.mock('html2canvas', () => jest.fn())
jest.mock('jspdf', () => ({ jsPDF: jest.fn().mockReturnValue({ addImage: jest.fn(), save: jest.fn(), internal: { pageSize: { getWidth: () => 0 } } }) }))
