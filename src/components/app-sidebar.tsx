import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  MessageSquare, Plus, Trash2, BrainCircuit, CalendarDays, LogOut,
  Home, FileText, Layers, Network, Lightbulb, Code2, Settings as SettingsIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { createThread, deleteThread, listThreads } from "@/lib/threads.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo, Wordmark } from "@/components/logo";

export function AppSidebar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (r) => r.location.pathname });

  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);

  const { data: threads = [] } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn(),
  });

  const createMut = useMutation({
    mutationFn: () => createFn(),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (path.includes(id)) navigate({ to: "/chat" });
    },
  });

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Logo size={32} />
          <div className="flex-1">
            <div className="text-sm"><Wordmark /></div>
            <div className="text-xs text-muted-foreground">Smart Learning Companion</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/dashboard"}>
                  <Link to="/dashboard"><Home className="h-4 w-4" /><span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  className="w-full justify-start gap-2"
                  size="sm"
                  onClick={() => createMut.mutate()}
                  disabled={createMut.isPending}
                >
                  <Plus className="h-4 w-4" /> New chat
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path.startsWith("/notes")}>
                  <Link to="/notes"><FileText className="h-4 w-4" /><span>Upload notes</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path.startsWith("/topic")}>
                  <Link to="/topic"><Lightbulb className="h-4 w-4" /><span>Topic explainer</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path.startsWith("/quiz")}>
                  <Link to="/quiz">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Quiz generator</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path.startsWith("/flashcards")}>
                  <Link to="/flashcards"><Layers className="h-4 w-4" /><span>Flashcards</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path.startsWith("/mindmap")}>
                  <Link to="/mindmap"><Network className="h-4 w-4" /><span>Mind map</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path.startsWith("/code")}>
                  <Link to="/code"><Code2 className="h-4 w-4" /><span>Code helper</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path.startsWith("/timetable")}>
                  <Link to="/timetable">
                    <CalendarDays className="h-4 w-4" />
                    <span>Study planner</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {threads.length === 0 && (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  No chats yet. Start one above.
                </div>
              )}
              {threads.map((t) => {
                const active = path === `/chat/${t.id}`;
                return (
                  <SidebarMenuItem key={t.id}>
                    <div className="group flex items-center gap-1">
                      <SidebarMenuButton asChild isActive={active} className="flex-1">
                        <Link
                          to="/chat/$threadId"
                          params={{ threadId: t.id }}
                          className="truncate"
                        >
                          <MessageSquare className="h-4 w-4 shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <button
                        aria-label="Delete chat"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteMut.mutate(t.id);
                        }}
                        className="rounded p-1 opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <Link to="/settings" className="w-full">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <SettingsIcon className="h-4 w-4" /> Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("Signed out");
            navigate({ to: "/" });
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}