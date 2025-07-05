"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, Plus, Mail, Crown, Shield, User, Search, MoreHorizontal } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { InviteMemberModal } from "./invite-member-modal"
import CreateTeamModal from "./create-team-modal"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import { useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"

export function TeamView() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch teams from Firestore where user is a member
  useEffect(() => {
    if (!user) return
    // Query selalu pakai filter + orderBy agar Firestore minta index jika belum ada
    const q = query(
      collection(db, "teams"),
      where("memberEmails", "array-contains", user.email),
      orderBy("createdAt", "desc")
    )
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setTeams(data)
        if (!selectedTeam && data.length > 0) setSelectedTeam(data[0])
      },
      (err) => {
        // Jika error index, tampilkan pesan dan link Firestore (seperti task/template)
        // eslint-disable-next-line no-console
        console.error("Firestore index required:", err.message)
      }
    )
    return () => unsub()
    // eslint-disable-next-line
  }, [user])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      member: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    }

    return colors[role as keyof typeof colors] || colors.member
  }


  const filteredMembers = selectedTeam?.members?.filter(
    (member: any) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Collaboration</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your teams and collaborate on tasks</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreateTeamModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="h-4 w-4 mr-2" />
            Invite Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Teams Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Teams</h3>

            <div className="space-y-3">
              {teams.length === 0 && (
                <div className="text-gray-500 text-sm">No teams found</div>
              )}
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTeam?.id === team.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{team.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{team.members?.length || 0} members</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            {/* Team Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {selectedTeam ? (
                    <>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${selectedTeam.color ?? '#ccc'}20` }}
                      >
                        <Users className="h-6 w-6" style={{ color: selectedTeam.color ?? '#ccc' }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedTeam.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{selectedTeam.description}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">No team selected</div>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{selectedTeam?.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{selectedTeam?.tasksCount || 0} tasks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="ml-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="p-6">
              <div className="space-y-4">
                {filteredMembers.map((member: any) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-10 h-10">
                        {member.avatar || member.photoURL ? (
                          <AvatarImage src={member.avatar || member.photoURL} alt={member.name} />
                        ) : null}
                        <AvatarFallback name={member.name} />
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                          {member.email === user?.email && (
                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(member.role)}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadge(member.role)}`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </div>

                      {member.email !== user?.email && (
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No members found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        teamName={selectedTeam?.name || ""}
      />

      <CreateTeamModal isOpen={isCreateTeamModalOpen} onClose={() => setIsCreateTeamModalOpen(false)} />
    </div>
  )
}
