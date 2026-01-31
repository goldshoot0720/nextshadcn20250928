"use client";

import { useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHeader, PageTitle } from "@/components/ui/section-header";
import { FormCard, FormGrid, FormActions } from "@/components/ui/form-card";
import { DataCard } from "@/components/ui/data-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { useCrud } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/lib/constants";

interface Routine {
  $id: string;
  name: string;
  note: string;
  lastdate1: string | null;
  lastdate2: string | null;
  lastdate3: string | null;
  link: string;
  photo: string;
}

interface RoutineFormData {
  name: string;
  note: string;
  lastdate1: string;
  lastdate2: string;
  lastdate3: string;
  link: string;
  photo: string;
}

const INITIAL_FORM: RoutineFormData = {
  name: "",
  note: "",
  lastdate1: "",
  lastdate2: "",
  lastdate3: "",
  link: "",
  photo: "",
};

export default function RoutineManagement() {
  const { items: routines, loading, error, create, update, remove } = useCrud<Routine>(API_ENDPOINTS.ROUTINE);
  const [form, setForm] = useState<RoutineFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("請輸入名稱");
      return;
    }

    const payload = {
      ...form,
      lastdate1: form.lastdate1 || null,
      lastdate2: form.lastdate2 || null,
      lastdate3: form.lastdate3 || null,
    };

    const success = editingId
      ? await update(editingId, payload)
      : await create(payload);

    if (success) {
      setForm(INITIAL_FORM);
      setEditingId(null);
      setIsFormOpen(false);
    }
  };

  const handleEdit = (routine: Routine) => {
    setForm({
      name: routine.name,
      note: routine.note || "",
      lastdate1: routine.lastdate1 ? routine.lastdate1.substring(0, 16) : "",
      lastdate2: routine.lastdate2 ? routine.lastdate2.substring(0, 16) : "",
      lastdate3: routine.lastdate3 ? routine.lastdate3.substring(0, 16) : "",
      link: routine.link || "",
      photo: routine.photo || "",
    });
    setEditingId(routine.$id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("確定要刪除此例行事項嗎？")) {
      await remove(id);
    }
  };

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const formatDateTime = (datetime: string | null) => {
    if (!datetime) return "-";
    return new Date(datetime).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="鋒兄例行"
        description="管理日常例行事項"
        badge={
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
            {routines.length}
          </span>
        }
      />

      {error && (
        <DataCard className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 whitespace-pre-line">{error.message}</p>
        </DataCard>
      )}

      {!error && (
        <>
          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full md:w-auto"
          >
            <Plus size={18} className="mr-2" />
            {isFormOpen ? "收起表單" : "新增例行事項"}
          </Button>

          {isFormOpen && (
            <FormCard title={editingId ? "編輯例行事項" : "新增例行事項"}>
              <form onSubmit={handleSubmit}>
                <FormGrid>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      名稱 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="例如：晨跑、閱讀"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">備註</label>
                    <Textarea
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      placeholder="額外說明"
                      maxLength={100}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">最近執行日期 1</label>
                    <Input
                      type="datetime-local"
                      value={form.lastdate1}
                      onChange={(e) => setForm({ ...form, lastdate1: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">最近執行日期 2</label>
                    <Input
                      type="datetime-local"
                      value={form.lastdate2}
                      onChange={(e) => setForm({ ...form, lastdate2: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">最近執行日期 3</label>
                    <Input
                      type="datetime-local"
                      value={form.lastdate3}
                      onChange={(e) => setForm({ ...form, lastdate3: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">連結</label>
                    <Input
                      type="url"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">圖片網址</label>
                    <Input
                      type="url"
                      value={form.photo}
                      onChange={(e) => setForm({ ...form, photo: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </FormGrid>

                <FormActions>
                  <Button type="submit">
                    {editingId ? "更新" : "新增"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    取消
                  </Button>
                </FormActions>
              </form>
            </FormCard>
          )}

          {!loading && routines.length === 0 ? (
            <EmptyState
              icon={<Calendar size={48} />}
              title="暫無例行事項"
              description="點擊上方按鈕新增第一筆例行事項"
            />
          ) : (
            <>
              {/* 桌面版表格 */}
              <div className="hidden md:block">
                <DataCard>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名稱</TableHead>
                        <TableHead>備註</TableHead>
                        <TableHead>最近執行 1</TableHead>
                        <TableHead>最近執行 2</TableHead>
                        <TableHead>最近執行 3</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routines.map((routine) => (
                        <TableRow key={routine.$id}>
                          <TableCell className="font-medium">{routine.name}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {routine.note || "-"}
                          </TableCell>
                          <TableCell>{formatDateTime(routine.lastdate1)}</TableCell>
                          <TableCell>{formatDateTime(routine.lastdate2)}</TableCell>
                          <TableCell>{formatDateTime(routine.lastdate3)}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(routine)}
                            >
                              編輯
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(routine.$id)}
                            >
                              刪除
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DataCard>
              </div>

              {/* 手機版卡片 */}
              <div className="md:hidden space-y-4">
                {routines.map((routine) => (
                  <DataCard key={routine.$id}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{routine.name}</h3>
                      </div>
                      {routine.note && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{routine.note}</p>
                      )}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">最近執行 1:</span>
                          <span>{formatDateTime(routine.lastdate1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">最近執行 2:</span>
                          <span>{formatDateTime(routine.lastdate2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">最近執行 3:</span>
                          <span>{formatDateTime(routine.lastdate3)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(routine)}
                          className="flex-1"
                        >
                          編輯
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(routine.$id)}
                          className="flex-1"
                        >
                          刪除
                        </Button>
                      </div>
                    </div>
                  </DataCard>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
