import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

export async function createTeam({ name, description, color, owner }: {
  name: string
  description?: string
  color: string
  owner: { id: string, name: string, email: string, avatar?: string }
}) {
  const members = [
    {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      role: "owner",
      avatar: owner.avatar || null,
    },
  ]
  const memberEmails = members.map((m) => m.email)
  const docRef = await addDoc(collection(db, "teams"), {
    name,
    description: description || "",
    color,
    members,
    memberEmails,
    createdAt: new Date(),
  })
  return docRef.id
}
