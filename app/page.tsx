"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// -------------------
// 型別定義
// -------------------
interface Food {
  $id: string;
  name: string;
  amount: number;
  todate: string;
  photo: string;
  isSubscription: boolean;
}

interface Subscription {
  $id: string;
  name: string;
  site: string;
  price: number;
  nextdate: string;
}

// -------------------
// 格式化日期
// -------------------
function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

// -------------------
// 主組件
// -------------------
export default function DashboardPage() {
  const [currentModule, setCurrentModule] = useState<"food" | "subscription">(
    "food"
  );

  // -------------------
  // Food 狀態
  // -------------------
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodForm, setFoodForm] = useState<Omit<Food, "$id">>({
    name: "",
    amount: 0,
    todate: "",
    photo: "",
    isSubscription: false,
  });
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [originalAmount, setOriginalAmount] = useState<{ [key: string]: number }>({});

  // -------------------
  // Subscription 狀態
  // -------------------
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [subForm, setSubForm] = useState<Omit<Subscription, "$id">>({
    name: "",
    site: "",
    price: 0,
    nextdate: "",
  });
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // -------------------
  // 載入資料
  // -------------------
  async function loadFoods() {
    const res = await fetch("/api/food", { cache: "no-store" });
    let data: Food[] = await res.json();
    data = data.sort(
      (a, b) => new Date(a.todate).getTime() - new Date(b.todate).getTime()
    );
    setFoods(data);
    return data;
  }

  async function loadSubs() {
    const res = await fetch("/api/subscription", { cache: "no-store" });
    let data: Subscription[] = await res.json();
    data = data.sort(
      (a, b) => new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime()
    );
    setSubs(data);
    return data;
  }

  useEffect(() => {
    async function loadInitialData() {
      const [foodsData, subsData] = await Promise.all([
        loadFoods(),
        loadSubs(),
      ]);

      if (foodsData.length === 0 && subsData.length > 0) {
        setCurrentModule("subscription");
      }
    }
    loadInitialData();
  }, []);

  // -------------------
  // Food CRUD
  // -------------------
  async function handleFoodSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...foodForm };
    let updatedFood: Food;

    if (editingFoodId) {
      const res = await fetch(`/api/food/${editingFoodId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      updatedFood = await res.json();
      const newFoods = foods.map((f) =>
        f.$id === editingFoodId ? updatedFood : f
      );
      newFoods.sort(
        (a, b) => new Date(a.todate).getTime() - new Date(b.todate).getTime()
      );
      setFoods(newFoods);
    } else {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      updatedFood = await res.json();
      if (updatedFood.isSubscription) {
        setOriginalAmount({
          ...originalAmount,
          [updatedFood.$id]: updatedFood.amount,
        });
      }
      const newFoods = [...foods, updatedFood];
      newFoods.sort(
        (a, b) => new Date(a.todate).getTime() - new Date(b.todate).getTime()
      );
      setFoods(newFoods);
    }
    setFoodForm({
      name: "",
      amount: 0,
      todate: "",
      photo: "",
      isSubscription: false,
    });
    setEditingFoodId(null);
  }

  async function handleFoodDelete(id: string) {
    if (!confirm("確定刪除？")) return;
    await fetch(`/api/food/${id}`, { method: "DELETE" });
    setFoods(foods.filter((f) => f.$id !== id));
  }

  async function handleAmountChange(food: Food, delta: number) {
    let newAmount = food.amount + delta;
    if (newAmount < 0) return;

    let updatedFood = { ...food, amount: newAmount };

    if (food.isSubscription && newAmount === 0) {
      const replenishmentAmount = originalAmount[food.$id] || food.amount;
      newAmount += replenishmentAmount;
      const currentTodate = new Date(food.todate);
      const nextTodate = new Date(
        currentTodate.setMonth(currentTodate.getMonth() + 1)
      );
      updatedFood = {
        ...updatedFood,
        amount: newAmount,
        todate: nextTodate.toISOString().split("T")[0],
      };
    }

    await fetch(`/api/food/${food.$id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFood),
    });

    setFoods(foods.map((f) => (f.$id === food.$id ? updatedFood : f)));
  }

  // -------------------
  // Subscription CRUD
  // -------------------
  async function handleSubSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...subForm };
    let updatedSub: Subscription;

    if (editingSubId) {
      const res = await fetch(`/api/subscription/${editingSubId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      updatedSub = await res.json();
      const newSubs = subs.map((s) =>
        s.$id === editingSubId ? updatedSub : s
      );
      newSubs.sort(
        (a, b) =>
          new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime()
      );
      setSubs(newSubs);
    } else {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      updatedSub = await res.json();
      const newSubs = [...subs, updatedSub];
      newSubs.sort(
        (a, b) =>
          new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime()
      );
      setSubs(newSubs);
    }
    setSubForm({ name: "", site: "", price: 0, nextdate: "" });
    setEditingSubId(null);
  }

  async function handleSubDelete(id: string) {
    if (!confirm("確定刪除？")) return;
    await fetch(`/api/subscription/${id}`, { method: "DELETE" });
    setSubs(subs.filter((s) => s.$id !== id));
  }

  // -------------------
  // Render Food
  // -------------------
  const renderFood = () => (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-4">食品管理</h1>
      <form onSubmit={handleFoodSubmit} className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="名稱"
          value={foodForm.name}
          onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
        />
        <Input
          placeholder="數量"
          type="number"
          value={foodForm.amount}
          onChange={(e) =>
            setFoodForm({ ...foodForm, amount: parseInt(e.target.value) || 0 })
          }
        />
        <Input
          placeholder="有效期限"
          type="date"
          value={foodForm.todate}
          onChange={(e) => setFoodForm({ ...foodForm, todate: e.target.value })}
        />
        <Input
          placeholder="圖片 URL"
          value={foodForm.photo}
          onChange={(e) => setFoodForm({ ...foodForm, photo: e.target.value })}
        />
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isSubscription"
            checked={foodForm.isSubscription}
            onChange={(e) =>
              setFoodForm({ ...foodForm, isSubscription: e.target.checked })
            }
          />
          <label htmlFor="isSubscription">訂閱項目</label>
        </div>
        <Button type="submit">{editingFoodId ? "更新" : "新增"}</Button>
        {editingFoodId && (
          <Button variant="outline" onClick={() => setEditingFoodId(null)}>
            取消
          </Button>
        )}
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名稱</TableHead>
            <TableHead>有效期限</TableHead>
            <TableHead>數量</TableHead>
            <TableHead>圖片</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {foods.map((f) => (
            <TableRow key={f.$id}>
              <TableCell>
                {f.name} {f.isSubscription && <span className="text-xs text-gray-500">(Sub)</span>}
              </TableCell>
              <TableCell>{formatDate(f.todate)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
              	  <span className="w-8 text-center">{f.amount}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAmountChange(f, -1)}
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAmountChange(f, 1)}
                  >
                    +
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {f.photo ? (
                  <img
                    src={f.photo}
                    alt={f.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  "無圖片"
                )}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFoodForm(f);
                    setEditingFoodId(f.$id);
                  }}
                >
                  編輯
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleFoodDelete(f.$id)}
                >
                  刪除
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // -------------------
  // Render Subscription
  // -------------------
  const renderSubscription = () => (
    <div>
      <h1 className="text-2xl font-bold mb-4">訂閱管理</h1>
      <form onSubmit={handleSubSubmit} className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="名稱"
          value={subForm.name}
          onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
        />
        <Input
          placeholder="網站"
          value={subForm.site}
          onChange={(e) => setSubForm({ ...subForm, site: e.target.value })}
        />
        <Input
          placeholder="價格"
          type="number"
          value={subForm.price}
          onChange={(e) =>
            setSubForm({ ...subForm, price: parseInt(e.target.value) || 0 })
          }
        />
        <Input
          placeholder="下次付款日期"
          type="date"
          value={subForm.nextdate}
          onChange={(e) => setSubForm({ ...subForm, nextdate: e.target.value })}
        />
        <Button type="submit">{editingSubId ? "更新" : "新增"}</Button>
        {editingSubId && (
          <Button variant="outline" onClick={() => setEditingSubId(null)}>
            取消
          </Button>
        )}
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名稱</TableHead>
            <TableHead>下次付款日期</TableHead>
            <TableHead>價格</TableHead>
            <TableHead>網站</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subs.map((s) => (
            <TableRow key={s.$id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{formatDate(s.nextdate)}</TableCell>
              <TableCell>{s.price}</TableCell>
              <TableCell>
                <a
                  href={s.site}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 underline"
                >
                  {s.site}
                </a>
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSubForm(s);
                    setEditingSubId(s.$id);
                  }}
                >
                  編輯
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleSubDelete(s.$id)}
                >
                  刪除
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // -------------------
  // 主畫面
  // -------------------
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* 側邊欄 */}
      <aside className="w-full md:w-60 p-4 border-r border-gray-200">
        <Button
          variant={currentModule === "food" ? "default" : "outline"}
          className="w-full mb-2"
          onClick={() => setCurrentModule("food")}
        >
          Food
        </Button>
        <Button
          variant={currentModule === "subscription" ? "default" : "outline"}
          className="w-full"
          onClick={() => setCurrentModule("subscription")}
        >
          Subscription
        </Button>
      </aside>

      {/* 主要內容 */}
      <main className="flex-1 p-4 overflow-auto">
        {/* 手機 / 桌機 / 平板都用同一邏輯 */}
        {currentModule === "food" ? renderFood() : renderSubscription()}
      </main>
    </div>
  );
}
