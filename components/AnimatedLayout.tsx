'use client';

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedLayoutProps {
    menuItems: ReactNode[];
    content: ReactNode;
}

export function AnimatedLayout({ menuItems, content }: AnimatedLayoutProps) {
    const menuVariants = {
        hidden: { opacity: 0, y: -9 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.3,
                duration: 0.6,
                ease: [0.33, 1, 0.66, 1]
            }
        })
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 33 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.9,
                ease: [0.33, 1, 0.66, 1]
            }
        }
    };

    return (
        <div>
            <div className='flex justify-center gap-1'>
                {menuItems.map((item, index) => (
                    <motion.div
                        key={index}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={menuVariants}
                    >
                        {item}
                    </motion.div>
                ))}
            </div>
            <motion.div 
                className='mt-6'
                initial="hidden"
                animate="visible"
                variants={contentVariants}
            >
                {content}
            </motion.div>
        </div>
    );
}
