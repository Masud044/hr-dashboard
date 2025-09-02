import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";

const ReceiveVoucher = () => {
  const [rows, setRows] = useState([
    { accountCode: " ", particulars: " ", debit: " ", credit:" " },
  ]);

  const [form, setForm] = useState({
    entryDate: " ",
    invoiceNo: " ",
    supporting: " ",
    description: " ",
    supplier: "",
    glDate: " ",
    paymentCode: "",
  });

//   const addRow = () => {
//     setRows([...rows, { accountCode: "", particulars: "", debit: "", credit:""}]);
//   };

//   const removeRow = (index) => {
//     const updated = [...rows];
//     updated.splice(index, 1);
//     setRows(updated);
//   };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

//   const totalAmount = rows.reduce(
//     (sum, row) => sum + Number(row.amount || 0),
//     0
//   );

  return (
    <>

      <Helmet>
         <title>Dashboard | Receive-voucher | HAMS</title>
      </Helmet>
    <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-700   bg-green-200 rounded-lg px-4 py-2 hover:bg-green-200">
        Journal Voucher
      </h2>

      {/* Top form section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 bg-purple-200 py-2 px-4 rounded-lg">
            Entry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.entryDate}
            onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600  bg-purple-200 py-2 px-4 rounded-lg">
            Invoice No
          </label>
          <input
            type="text"
            value={form.invoiceNo}
            onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600  bg-purple-200 py-2 px-4 rounded-lg">
            No. of Supporting
          </label>
          <input
            type="number"
            value={form.supporting}
            onChange={(e) => setForm({ ...form, supporting: e.target.value })}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 bg-blue-200 py-2 px-4 rounded-lg">
          Description
        </label>
        <textarea
          type="text"
          value={form.supporting}
          onChange={(e) => setForm({ ...form, supporting: e.target.value })}
          className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-600  bg-orange-200 py-2 px-4 rounded-lg">
            GL Date
          </label>
          <input
            type="date"
            value={form.glDate}
            onChange={(e) => setForm({ ...form, glDate: e.target.value })}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>
         <div>
          <label className="block text-sm font-medium text-foreground mb-2  bg-orange-200 py-2 px-4 rounded-lg">
            Available Balance:
          </label>
          <input
            type="number"
            value={form.availableBalance}
            className="w-full px-3 py-2 border border-input-border rounded bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2  bg-orange-200 py-2 px-4 rounded-lg">
            Total Amount
          </label>
          <input
            type="number"
            value={form.totalAmount}
            className="w-full px-3 py-2 border border-input-border rounded bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
       
      </div>

      

     
      
      <div>
       

        <h3 className="text-lg font-medium text-gray-700 mb-2  bg-green-200 py-2 px-4 rounded-lg">Accounts</h3>
        <table className="w-full  rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 bg-green-100 ">
                Account Code
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 bg-purple-200">
                Particulars
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-600 bg-blue-200">
                Debit
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-600 bg-orange-200">Credit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.accountCode}
                    onChange={(e) =>
                      handleRowChange(index, "accountCode", e.target.value)
                    }
                    className="w-full border rounded-lg px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.particulars}
                    onChange={(e) =>
                      handleRowChange(index, "particulars", e.target.value)
                    }
                    className="w-full border rounded-lg px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <input
                    type="number"
                    value={row.debit}
                    onChange={(e) =>
                      handleRowChange(index, "debit", e.target.value)
                    }
                    className="w-24 border rounded-lg px-2 py-1 text-right"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <input
                    type="number"
                    value={row.credit}
                    onChange={(e) =>
                      handleRowChange(index, "credit", e.target.value)
                    }
                    className="w-24 border rounded-lg px-2 py-1 text-right"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* <div className="flex justify-between items-center mt-3">
          <button
            onClick={addRow}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
          >
            <Plus className="w-4 h-4" /> Add Row
          </button>
          <div className="text-right font-semibold text-gray-700">
            Total: {totalAmount.toFixed(2)}
          </div>
        </div> */}
      </div>

      {/* Action buttons */}
      {/* <div className="flex justify-end gap-3">
        <button className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
          Cancel
        </button>
        <button className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow">
          Save Voucher
        </button>
      </div> */}
    </div></>
    
  );
};

export default ReceiveVoucher;
